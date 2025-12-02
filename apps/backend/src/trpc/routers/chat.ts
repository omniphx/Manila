import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc.js';
import { conversations, messages } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { generateChatWithTools } from '../../services/chat-with-tools.js';

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

  // Delete a conversation
  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
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

      // Delete the conversation (messages will cascade delete)
      await ctx.db
        .delete(conversations)
        .where(eq(conversations.id, input.conversationId));

      return { success: true };
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

      // Get conversation history (last 10 messages for context)
      const conversationHistory = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(10);

      // Reverse to chronological order and exclude the just-added message
      const historyForLLM = conversationHistory
        .reverse()
        .slice(0, -1)
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Generate AI response using tools for document search/retrieval
      const chatResult = await generateChatWithTools(
        ctx.user.userId,
        input.content,
        historyForLLM
      );

      // Save AI response with citations
      const [assistantMessage] = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          role: 'assistant',
          content: chatResult.answer,
          metadata: JSON.stringify({
            citations: chatResult.citations,
            toolCalls: chatResult.toolCalls,
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
