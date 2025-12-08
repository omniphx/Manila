import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc.js";
import { conversations, messages, files } from "../../db/schema.js";
import { eq, desc, inArray } from "drizzle-orm";
import { generateChatWithTools } from "../../services/chat-with-tools.js";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { FILELAMA_SYSTEM_PROMPT } from "../../constants/prompts.js";

/**
 * Generate a concise conversation title from the first user message
 */
async function generateConversationTitle(userMessage: string): Promise<string> {
  try {
    const result = await generateText({
      model: openai.chat("gpt-4o"),
      prompt: `Generate a very concise title (3-5 words maximum) for a conversation that starts with this user message:

"${userMessage}"

Return ONLY the title, nothing else. Do not use quotes.`,
    });

    return result.text.trim() || "New Conversation";
  } catch (error) {
    console.error("[Chat] Error generating title:", error);
    return "New Conversation";
  }
}

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
          code: "NOT_FOUND",
          message: "Conversation not found",
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
          code: "NOT_FOUND",
          message: "Conversation not found",
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
        fileIds: z.array(z.string().uuid()).optional(),
      }),
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
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      // Check if this is the first message in the conversation
      const existingMessages = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId));

      // If this is the first message, insert the system prompt as a debug message
      if (existingMessages.length === 0) {
        await ctx.db.insert(messages).values({
          conversationId: input.conversationId,
          role: "system",
          content: FILELAMA_SYSTEM_PROMPT,
          metadata: JSON.stringify({
            isSystemMessage: true,
            isDebugMessage: true,
          }),
        });
      }

      // Save user message
      const [userMessage] = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          role: "user",
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

      // Reverse to chronological order, exclude the just-added message, and filter out system messages
      const historyForLLM = conversationHistory
        .reverse()
        .slice(0, -1)
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      // Fetch mentioned files if any
      let mentionedFilesContext = "";
      let mentionedFiles: Array<{
        id: string;
        originalFilename: string;
      }> = [];

      if (input.fileIds && input.fileIds.length > 0) {
        const fetchedFiles = await ctx.db
          .select()
          .from(files)
          .where(inArray(files.id, input.fileIds));

        // Verify all files belong to the user
        const unauthorizedFiles = fetchedFiles.filter(
          (f) => f.userId !== ctx.user.userId,
        );
        if (unauthorizedFiles.length > 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to one or more mentioned files",
          });
        }

        // Store mentioned files for citation
        mentionedFiles = fetchedFiles.map((f) => ({
          id: f.id,
          originalFilename: f.originalFilename,
        }));

        // Build context from mentioned files
        if (fetchedFiles.length > 0) {
          mentionedFilesContext = "\n\n---\n\nReferenced Documents:\n\n";
          for (const file of fetchedFiles) {
            if (file.extractedContent) {
              mentionedFilesContext += `### ${file.originalFilename}\n\n${file.extractedContent}\n\n---\n\n`;
            } else {
              mentionedFilesContext += `### ${file.originalFilename}\n\n[Document is still being processed or contains no extractable text]\n\n---\n\n`;
            }
          }
        }
      }

      // Combine user question with mentioned files context
      const questionWithContext = input.content + mentionedFilesContext;

      // Generate AI response using tools for document search/retrieval
      const chatResult = await generateChatWithTools(
        ctx.user.userId,
        questionWithContext,
        historyForLLM,
      );

      // Add @ mentioned files to citations if they were used
      const allCitations = [
        ...chatResult.citations,
        ...mentionedFiles.map((file) => ({
          documentId: file.id,
          filename: file.originalFilename,
        })),
      ];

      // Deduplicate citations by documentId
      const uniqueCitations = Array.from(
        new Map(allCitations.map((c) => [c.documentId, c])).values(),
      );

      // Save AI response with citations, tool call details, and activities
      const [assistantMessage] = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          role: "assistant",
          content: chatResult.answer,
          metadata: JSON.stringify({
            citations: uniqueCitations,
            toolCalls: chatResult.toolCalls,
            toolCallDetails: chatResult.toolCallDetails,
            activities: chatResult.activities,
          }),
        })
        .returning();

      // If this is the first user message, generate a title for the conversation
      const allMessages = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId));

      const userMessages = allMessages.filter((m) => m.role === "user");

      if (
        userMessages.length === 1 &&
        (conversation.title === "New Conversation" || !conversation.title)
      ) {
        // Generate a title from the first user message
        const generatedTitle = await generateConversationTitle(input.content);

        await ctx.db
          .update(conversations)
          .set({
            title: generatedTitle,
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, input.conversationId));
      } else {
        // Just update the timestamp
        await ctx.db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, input.conversationId));
      }

      return {
        userMessage,
        assistantMessage,
      };
    }),
});
