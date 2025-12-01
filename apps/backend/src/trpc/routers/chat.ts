import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc.js';
import { conversations, messages } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { askQuestion } from '../../services/rag.js';

export const chatRouter = router({
  // Create a new conversation
  createConversation: protectedProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const [conversation] = await ctx.db
        .insert(conversations)
        .values({
          userId: ctx.user.userId,
          title: input.title,
        })
        .returning();

      return conversation;
    }),

  // Get all conversations for the current user
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, ctx.user.userId))
      .orderBy(desc(conversations.updatedAt));
  }),

  // Get messages for a specific conversation
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify the conversation belongs to the user
      const [conversation] = await ctx.db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (!conversation || conversation.userId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      return ctx.db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(messages.createdAt);
    }),

  // Send a message and get AI response
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        content: z.string().min(1).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the conversation belongs to the user
      const [conversation] = await ctx.db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (!conversation || conversation.userId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      // Save user message
      const [userMessage] = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          role: 'user',
          content: input.content,
        })
        .returning();

      // Use RAG to generate AI response with citations
      const ragResult = await askQuestion(
        ctx.user.userId,
        input.content,
        5, // top-k chunks
        0.5 // similarity threshold
      );

      // Save AI response with citations
      const [assistantMessage] = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          role: 'assistant',
          content: ragResult.answer,
          metadata: JSON.stringify({
            citations: ragResult.citations,
            chunksUsed: ragResult.chunks.length
          }),
        })
        .returning();

      // Update conversation's updatedAt timestamp
      await ctx.db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      return {
        userMessage,
        assistantMessage,
      };
    }),
});
