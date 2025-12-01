import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '../lib/db.js';
import { embeddings, files } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { generateQueryEmbedding } from './embeddings.js';

/**
 * A document chunk retrieved from the vector database
 */
export interface RetrievedChunk {
  id: string;
  fileId: string | null;
  filename: string | null;
  content: string;
  metadata: string | null;
  similarity: number;
}

/**
 * Citation information for a source document
 */
export interface Citation {
  fileId: string;
  filename: string;
  chunkIndex: number;
  similarity: number;
}

/**
 * Result of a RAG query
 */
export interface RAGResult {
  answer: string;
  citations: Citation[];
  chunks: RetrievedChunk[];
}

/**
 * Ask a question using RAG (Retrieval-Augmented Generation)
 *
 * Process:
 * 1. Generate embedding for the user's question
 * 2. Search for top-k most similar document chunks
 * 3. Format chunks with source identifiers
 * 4. Pass chunks to LLM with instructions to cite sources
 * 5. Return answer with citations
 *
 * @param userId - The user asking the question
 * @param question - The question to answer
 * @param topK - Number of similar chunks to retrieve (default: 5)
 * @param similarityThreshold - Minimum similarity score (0-1) to include a chunk (default: 0.7)
 */
export async function askQuestion(
  userId: string,
  question: string,
  topK: number = 5,
  similarityThreshold: number = 0.5
): Promise<RAGResult> {
  try {
    console.log(`RAG: Processing question for user ${userId}: "${question}"`);
    console.log(`RAG: Using topK=${topK}, threshold=${similarityThreshold}`);

    // Step 1: Generate embedding for the question
    const queryEmbedding = await generateQueryEmbedding(question);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // Step 2: Search for similar chunks
    const chunks = await db
      .select({
        id: embeddings.id,
        fileId: embeddings.fileId,
        filename: files.originalFilename,
        content: embeddings.content,
        metadata: embeddings.metadata,
        similarity: sql<number>`1 - (${embeddings.embedding} <=> ${embeddingString}::vector)`,
      })
      .from(embeddings)
      .leftJoin(files, eq(embeddings.fileId, files.id))
      .where(eq(embeddings.userId, userId))
      .orderBy(sql`${embeddings.embedding} <=> ${embeddingString}::vector`)
      .limit(topK);

    console.log(`RAG: Found ${chunks.length} chunks, similarity scores:`, chunks.map(c => c.similarity));

    // Filter by similarity threshold
    const relevantChunks = chunks.filter((chunk) => chunk.similarity >= similarityThreshold);

    console.log(`RAG: ${relevantChunks.length} chunks passed threshold of ${similarityThreshold}`);

    // If no relevant chunks found, return early
    if (relevantChunks.length === 0) {
      return {
        answer: "I couldn't find any relevant information in your documents to answer this question. Please make sure you've uploaded relevant documents or try rephrasing your question.",
        citations: [],
        chunks: [],
      };
    }

    // Step 3: Format chunks with source identifiers for the LLM
    const contextsWithSources = relevantChunks.map((chunk, idx) => {
      let metadata: { chunkIndex?: number } = {};
      try {
        if (chunk.metadata) {
          metadata = JSON.parse(chunk.metadata);
        }
      } catch (e) {
        // Ignore parse errors
      }

      return {
        sourceId: `[${idx + 1}]`,
        filename: chunk.filename || 'Unknown',
        chunkIndex: metadata.chunkIndex ?? 0,
        content: chunk.content,
        similarity: chunk.similarity,
        fileId: chunk.fileId,
      };
    });

    // Step 4: Build system message with source-tagged context
    const systemMessage = `You are Manila, an AI assistant that helps users understand and analyze their uploaded documents.

You have access to the following document excerpts that are relevant to the user's question. Each excerpt is tagged with a source identifier like [1], [2], etc.

${contextsWithSources
  .map(
    (ctx) =>
      `${ctx.sourceId} From "${ctx.filename}" (chunk ${ctx.chunkIndex + 1}):\n${ctx.content}\n`
  )
  .join('\n')}

IMPORTANT: When answering the question, you MUST cite your sources using the source identifiers (e.g., [1], [2]). Place citations at the end of the sentence or paragraph where you use information from that source. If you use information from multiple sources, list all relevant source identifiers.

If the provided excerpts don't contain enough information to fully answer the question, acknowledge this and answer to the best of your ability with the available information.`;

    // Step 5: Call LLM to generate answer
    const result = await generateText({
      model: openai('gpt-4o'),
      system: systemMessage,
      prompt: question,
      maxTokens: 2048,
    });

    // Step 6: Build citations list
    const citations: Citation[] = contextsWithSources
      .filter((ctx) => ctx.fileId !== null)
      .map((ctx) => ({
        fileId: ctx.fileId!,
        filename: ctx.filename,
        chunkIndex: ctx.chunkIndex,
        similarity: ctx.similarity,
      }));

    return {
      answer: result.text,
      citations,
      chunks: relevantChunks,
    };
  } catch (error) {
    console.error('Error in askQuestion:', error);
    throw new Error('Failed to generate answer');
  }
}
