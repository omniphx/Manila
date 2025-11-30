import { embedMany } from 'ai';
import { eq } from 'drizzle-orm';
import { createOpenAI } from '@ai-sdk/openai';
import { createHash } from 'crypto';
import { db } from '../lib/db.js';
import { embeddings } from '../db/schema.js';
import { env } from '../lib/env.js';

// Embedding model configuration
const EMBEDDING_MODEL = 'text-embedding-3-small' as const;

/**
 * Chunk with position tracking
 */
interface Chunk {
  text: string;
  startPos: number;
  endPos: number;
}

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
 * - Track actual positions in the original text for each chunk
 */
function chunkText(text: string): Chunk[] {
  const maxChars = CHUNK_CONFIG.maxChunkSize * CHUNK_CONFIG.estimatedCharsPerToken;
  const overlapChars = CHUNK_CONFIG.chunkOverlap * CHUNK_CONFIG.estimatedCharsPerToken;

  // If text is small enough, return as single chunk
  if (text.length <= maxChars) {
    return [{ text, startPos: 0, endPos: text.length }];
  }

  const chunks: Chunk[] = [];
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

    // Store chunk with its actual position
    chunks.push({
      text: text.substring(startPos, endPos),
      startPos,
      endPos,
    });

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

    // Check if embeddings already exist for this file
    const existingEmbeddings = await db
      .select({ id: embeddings.id })
      .from(embeddings)
      .where(eq(embeddings.fileId, fileId))
      .limit(1);

    if (existingEmbeddings.length > 0) {
      console.log(`Embeddings already exist for file ${fileId}, skipping`);
      const allEmbeddings = await db
        .select({ id: embeddings.id })
        .from(embeddings)
        .where(eq(embeddings.fileId, fileId));

      return {
        success: true,
        embeddingIds: allEmbeddings.map((e) => e.id),
      };
    }

    // Step 1: Chunk the text
    const chunks = chunkText(content);
    console.log(`Chunked content into ${chunks.length} chunks for file ${fileId}`);

    // Step 2: Generate embeddings for all chunks using embedMany
    const openai = createOpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    const embeddingModel = openai.embedding(EMBEDDING_MODEL);

    const { embeddings: embeddingVectors } = await embedMany({
      model: embeddingModel,
      values: chunks.map((c) => c.text),
    });

    // Step 3: Prepare all values for batch insert
    const totalChunks = chunks.length;
    const valuesToInsert = chunks.map((chunk, index) => {
      const metadata: ChunkMetadata = {
        chunkIndex: index,
        totalChunks,
        startPos: chunk.startPos,
        endPos: chunk.endPos,
      };

      // Generate content hash for deduplication
      const contentHash = createHash('sha256').update(chunk.text).digest('hex');

      return {
        userId,
        fileId,
        content: chunk.text,
        contentHash,
        embedding: embeddingVectors[index],
        embeddingModel: EMBEDDING_MODEL,
        metadata: JSON.stringify(metadata),
      };
    });

    // Step 4: Batch insert all embeddings
    const insertedEmbeddings = await db
      .insert(embeddings)
      .values(valuesToInsert)
      .returning({ id: embeddings.id });

    console.log(
      `Generated ${insertedEmbeddings.length} embeddings for file ${fileId}`
    );

    return {
      success: true,
      embeddingIds: insertedEmbeddings.map((e) => e.id),
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
