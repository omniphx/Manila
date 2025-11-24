import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc.js';
import { embeddings } from '../../db/schema.js';
import { eq, sql } from 'drizzle-orm';

export const embeddingsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        embedding: z.array(z.number()).length(1536),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const embeddingString = `[${input.embedding.join(',')}]`;

      const [newEmbedding] = await ctx.db
        .insert(embeddings)
        .values({
          userId: ctx.user.userId,
          content: input.content,
          embedding: sql`${embeddingString}::vector`,
          metadata: input.metadata,
        })
        .returning();

      return {
        id: newEmbedding.id,
        content: newEmbedding.content,
        metadata: newEmbedding.metadata,
        createdAt: newEmbedding.createdAt,
      };
    }),

  search: protectedProcedure
    .input(
      z.object({
        embedding: z.array(z.number()).length(1536),
        limit: z.number().min(1).max(100).default(10),
        threshold: z.number().min(0).max(1).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const embeddingString = `[${input.embedding.join(',')}]`;

      let query = ctx.db
        .select({
          id: embeddings.id,
          content: embeddings.content,
          metadata: embeddings.metadata,
          createdAt: embeddings.createdAt,
          similarity: sql<number>`1 - (${embeddings.embedding} <=> ${embeddingString}::vector)`,
        })
        .from(embeddings)
        .where(eq(embeddings.userId, ctx.user.userId))
        .orderBy(sql`${embeddings.embedding} <=> ${embeddingString}::vector`)
        .limit(input.limit);

      const results = await query;

      if (input.threshold !== undefined) {
        return results.filter((r) => r.similarity >= input.threshold!);
      }

      return results;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [embedding] = await ctx.db
        .select()
        .from(embeddings)
        .where(eq(embeddings.id, input.id))
        .limit(1);

      if (!embedding || embedding.userId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Embedding not found',
        });
      }

      return {
        id: embedding.id,
        content: embedding.content,
        metadata: embedding.metadata,
        createdAt: embedding.createdAt,
      };
    }),

  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select({
          id: embeddings.id,
          content: embeddings.content,
          metadata: embeddings.metadata,
          createdAt: embeddings.createdAt,
        })
        .from(embeddings)
        .where(eq(embeddings.userId, ctx.user.userId))
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(sql`${embeddings.createdAt} DESC`);

      return results;
    }),
});
