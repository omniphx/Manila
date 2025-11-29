import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';
import { conversations, messages } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export const chatRouter = router({
  // Create a new conversation
  createConversation: protectedProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const [conversation] = await ctx.db
        .insert(conversations)
        .values({
          userId: ctx.user.id,
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
      .where(eq(conversations.userId, ctx.user.id))
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

      if (!conversation || conversation.userId !== ctx.user.id) {
        throw new Error('Conversation not found');
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
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the conversation belongs to the user
      const [conversation] = await ctx.db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (!conversation || conversation.userId !== ctx.user.id) {
        throw new Error('Conversation not found');
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

      // Get user's files for context
      const userFiles = await ctx.db.query.files.findMany({
        where: (files, { eq }) => eq(files.userId, ctx.user.id),
      });

      // TODO: Implement AI response generation using embeddings
      // For now, return a placeholder response
      const aiResponseContent = `I understand you're asking: "${input.content}". This is a placeholder response. In the future, I'll search through your ${userFiles.length} uploaded document(s) and provide relevant answers with citations.`;

      // Save AI response
      const [assistantMessage] = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          role: 'assistant',
          content: aiResponseContent,
          metadata: JSON.stringify({ citations: [] }),
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
