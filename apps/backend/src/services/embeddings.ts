import { embedMany } from 'ai';
import { eq } from 'drizzle-orm';
import { createOpenAI } from '@ai-sdk/openai';
import { db } from '../lib/db.js';
import { embeddings } from '../db/schema.js';
import { env } from '../lib/env.js';

/**
 * Chunk metadata stored in the database
 */
interface ChunkMetadata {
  chunkIndex: number;
  totalChunks: number;
  startPos: number;
  endPos: number;
}

/**
 * Result of embedding generation
 */
export interface EmbeddingResult {
  success: boolean;
  embeddingIds: string[];
  error?: string;
}

/**
 * Configuration for text chunking
 */
const CHUNK_CONFIG = {
  maxChunkSize: 1000, // Maximum tokens per chunk (conservative estimate)
  chunkOverlap: 200, // Overlap between chunks to preserve context
  estimatedCharsPerToken: 4, // Rough estimate: 1 token ≈ 4 characters
};

/**
 * Split text into overlapping chunks for embedding
 *
 * Strategy:
 * - Split on sentence boundaries when possible (periods, newlines)
 * - Overlap chunks to preserve context across boundaries
 * - Target ~1000 tokens per chunk (conservative for text-embedding-3-small's 8191 limit)
 */
function chunkText(text: string): string[] {
  const maxChars = CHUNK_CONFIG.maxChunkSize * CHUNK_CONFIG.estimatedCharsPerToken;
  const overlapChars = CHUNK_CONFIG.chunkOverlap * CHUNK_CONFIG.estimatedCharsPerToken;

  // If text is small enough, return as single chunk
  if (text.length <= maxChars) {
    return [text];
  }

  const chunks: string[] = [];
  let startPos = 0;

  while (startPos < text.length) {
    let endPos = Math.min(startPos + maxChars, text.length);

    // If not at end of text, try to find a sentence boundary
    if (endPos < text.length) {
      // Look for period, newline, or question mark within the last 20% of the chunk
      const searchStart = endPos - Math.floor(maxChars * 0.2);
      const searchText = text.substring(searchStart, endPos);
      const lastPeriod = Math.max(
        searchText.lastIndexOf('. '),
        searchText.lastIndexOf('\n'),
        searchText.lastIndexOf('? '),
        searchText.lastIndexOf('! ')
      );

      if (lastPeriod !== -1) {
        endPos = searchStart + lastPeriod + 1;
      }
    }

    chunks.push(text.substring(startPos, endPos));

    // Move start position forward, with overlap
    // Ensure we always advance by at least 1 character to prevent infinite loops
    const nextStart = endPos - overlapChars;
    startPos = Math.max(nextStart, startPos + 1);

    // If we would overlap more than the chunk size, just move to endPos
    if (endPos - startPos > maxChars) {
      startPos = endPos - overlapChars;
    }
  }

  return chunks;
}

/**
 * Generate embeddings for a file's extracted content
 *
 * Process:
 * 1. Chunk the text into manageable pieces
 * 2. Generate embeddings for each chunk using Vercel AI SDK
 * 3. Store embeddings in the database with chunk metadata
 *
 * @param fileId - The ID of the file being embedded
 * @param userId - The user who owns the file
 * @param content - The extracted text content to embed
 */
export async function generateEmbeddings(
  fileId: string,
  userId: string,
  content: string
): Promise<EmbeddingResult> {
  try {
    // Skip if content is empty
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        embeddingIds: [],
        error: 'Content is empty',
      };
    }

    // Step 1: Chunk the text
    const chunks = chunkText(content);
    console.log(`Chunked content into ${chunks.length} chunks for file ${fileId}`);

    // Step 2: Generate embeddings for all chunks using embedMany
    const openai = createOpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    const embeddingModel = openai.embedding('text-embedding-3-small');

    const { embeddings: embeddingVectors } = await embedMany({
      model: embeddingModel,
      values: chunks,
    });

    const embeddingResults = chunks.map((chunk, index) => ({
      chunk,
      embedding: embeddingVectors[index],
      index,
    }));

    // Step 3: Store embeddings in database
    const totalChunks = chunks.length;
    const insertedEmbeddings = await Promise.all(
      embeddingResults.map(async ({ chunk, embedding, index }) => {
        // Calculate character positions
        let startPos = 0;
        for (let i = 0; i < index; i++) {
          startPos += chunks[i].length;
        }
        const endPos = startPos + chunk.length;

        const metadata: ChunkMetadata = {
          chunkIndex: index,
          totalChunks,
          startPos,
          endPos,
        };

        const [inserted] = await db
          .insert(embeddings)
          .values({
            userId,
            fileId,
            content: chunk,
            embedding,
            metadata: JSON.stringify(metadata),
          })
          .returning();

        return inserted.id;
      })
    );

    console.log(
      `Generated ${insertedEmbeddings.length} embeddings for file ${fileId}`
    );

    return {
      success: true,
      embeddingIds: insertedEmbeddings,
    };
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return {
      success: false,
      embeddingIds: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete all embeddings for a specific file
 * Used when a file is deleted or needs to be re-embedded
 */
export async function deleteFileEmbeddings(fileId: string): Promise<void> {
  await db.delete(embeddings).where(eq(embeddings.fileId, fileId));
}
