import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { searchDocuments, getDocument } from "./full-text-search.js";

/**
 * Zod schemas for tool inputs
 */
const searchDocumentsSchema = z.object({
  query: z
    .string()
    .describe(
      'Search keywords or phrase. Use full expanded terms instead of acronyms (e.g., "adjusted gross income" not "AGI", "individual retirement account" not "IRA"). Examples: "tax deduction", "2023 income", "adjusted gross income"'
    ),
  page: z
    .number()
    .describe("Page number for pagination")
    .optional(),
  pageSize: z
    .number()
    .describe("Results per page (max 50)")
    .optional(),
});

const getDocumentSchema = z.object({
  documentId: z.string().describe("The document ID from search results"),
  maxLength: z
    .number()
    .describe("Maximum characters to return (default 50000)")
    .optional(),
});

/**
 * Infer TypeScript types from Zod schemas
 */
type SearchDocumentsInput = z.infer<typeof searchDocumentsSchema>;
type GetDocumentInput = z.infer<typeof getDocumentSchema>;

/**
 * Create tool definitions with userId bound
 */
function createTools(userId: string) {

  return {
    search_documents: tool({
      description: `Search through the user's uploaded documents using keywords.
      Use this to find relevant documents before answering questions.
      Returns document summaries with highlighted snippets showing matched text.

      IMPORTANT: Always expand acronyms to their full form when searching (e.g., use "adjusted gross income" instead of "AGI").`,
      inputSchema: searchDocumentsSchema,
      execute: async (args) => {
        const {
          query,
          page = 1,
          pageSize = 10,
        } = args;
        console.log(`[Tool] search_documents called:`, {
          query,
          page,
        });

        const results = await searchDocuments(
          userId,
          query,
          {},
          page,
          pageSize
        );

        // Format results for LLM
        return {
          results: results.results.map((r) => ({
            id: r.id,
            filename: r.filename,
            snippet: r.headline, // Use highlighted headline
            relevance: r.rank,
          })),
          total: results.total,
          page: results.page,
          hasMore: results.hasMore,
          message: `Found ${results.total} documents. Showing ${results.results.length} results on page ${page}.`,
        };
      },
    }),

    get_document: tool({
      description: `Retrieve the full content of a specific document by its ID.
      Use this after searching to get detailed information from a document.
      The content may be truncated if the document is very large.`,
      inputSchema: getDocumentSchema,
      execute: async (args) => {
        const { documentId, maxLength = 50000 } = args;
        console.log(`[Tool] get_document called:`, { documentId, maxLength });

        const document = await getDocument(userId, documentId, maxLength);

        if (!document) {
          return {
            success: false,
            error: "Document not found or you do not have access to it.",
          };
        }

        return {
          success: true,
          id: document.id,
          filename: document.filename,
          mimeType: document.mimeType,
          size: document.size,
          content: document.content,
          createdAt: document.createdAt,
        };
      },
    }),
  };
}

/**
 * Citation information extracted from tool calls
 */
export interface Citation {
  documentId: string;
  filename: string;
  snippet?: string;
}

/**
 * Tool call information for debugging
 */
export interface ToolCallInfo {
  toolName: string;
  args: Record<string, any>;
  result?: any;
}

/**
 * User-friendly activity message for tool calls
 */
export interface ToolActivity {
  action: string;
  details: string;
}

/**
 * Chat response with tool-based document retrieval
 */
export interface ChatResponse {
  answer: string;
  citations: Citation[];
  toolCalls: number;
  toolCallDetails?: ToolCallInfo[];
  activities?: ToolActivity[];
}

/**
 * Generate a chat response using tools for document search and retrieval
 *
 * @param userId - User ID for document access
 * @param question - User's question
 * @param conversationHistory - Previous messages in the conversation
 */
export async function generateChatWithTools(
  userId: string,
  question: string,
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }> = []
): Promise<ChatResponse> {
  console.log(`[Chat] Processing question for user ${userId}: "${question}"`);

  const systemPrompt = `You are Manila, an AI assistant that helps users find and understand information from their uploaded documents.

You have access to two tools:
1. search_documents - Search for documents using keywords and filters
2. get_document - Retrieve full content of a specific document

CRITICAL RULES - You MUST follow these:
1. ALWAYS use search_documents for EVERY question - this is mandatory, not optional
2. You MUST NOT answer questions without searching the user's documents first
3. Generate multiple search queries with different keyword combinations to maximize document discovery:
   - Create 3-5 different search queries from the user's question
   - Use different permutations of keywords (concise, 2-4 words each)
   - Try synonyms, related terms, and different phrasings
   - Example: For "AI impact on traffic" try: "AI traffic", "artificial intelligence traffic", "AI organic search", "traffic decline AI", "search algorithm changes"
4. Execute ALL search queries you generate - call search_documents multiple times with different queries
5. After searching, if needed, use get_document to retrieve full content of promising documents
6. Base your answers ONLY on information found in the user's documents
7. Always cite your sources using the format: [filename]
8. If no relevant documents are found after all searches, tell the user you couldn't find information in their documents

Be concise and helpful. Focus on answering the user's specific question based on their documents.`;

  try {
    // Create tools with userId bound
    const tools = createTools(userId);

    const result = await generateText({
      model: openai.chat("gpt-4o"),
      system: systemPrompt,
      messages: [
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user" as const,
          content: question,
        },
      ],
      tools,
      toolChoice: "auto",
      experimental_telemetry: {
        isEnabled: true,
        functionId: "chat-with-tools",
      },
    });

    // Extract citations, tool call details, and activities from tool calls
    const citations: Citation[] = [];
    const toolCallDetails: ToolCallInfo[] = [];
    const activities: ToolActivity[] = [];
    const toolCalls = result.steps?.length || 0;

    if (result.steps) {
      for (const step of result.steps) {
        if (step.toolCalls && step.toolResults) {
          for (let i = 0; i < step.toolCalls.length; i++) {
            const toolCall = step.toolCalls[i];
            const toolResult = step.toolResults[i];

            // Store tool call details for debugging
            toolCallDetails.push({
              toolName: toolCall.toolName,
              args: toolCall.input as Record<string, any>,
              result: toolResult,
            });

            // Generate user-friendly activity messages with proper type narrowing
            if (toolCall.toolName === "search_documents") {
              const searchInput = toolCall.input as SearchDocumentsInput;
              const query = searchInput.query || "unknown query";
              console.log('[Chat] Extracted search query:', query);
              activities.push({
                action: "search",
                details: query,
              });
            } else if (toolCall.toolName === "get_document") {
              activities.push({
                action: "retrieve",
                details: "document content",
              });
            }

            if (toolCall.toolName === "search_documents" && toolResult) {
              const searchResults = toolResult as any;
              // Handle different response structures from AI SDK
              const results = searchResults.output?.results || searchResults.results || searchResults.value?.results;
              console.log('[Chat] Found', results?.length || 0, 'search results');
              if (results && Array.isArray(results)) {
                for (const doc of results) {
                  citations.push({
                    documentId: doc.id,
                    filename: doc.filename,
                    snippet: doc.snippet,
                  });
                }
              }
            } else if (
              toolCall.toolName === "get_document" &&
              toolResult
            ) {
              const docResult = toolResult as any;
              // Handle different response structures from AI SDK
              const result = docResult.output || docResult.value || docResult;
              if (result.success) {
                citations.push({
                  documentId: result.id,
                  filename: result.filename,
                });
              }
            }
          }
        }
      }
    }

    // Deduplicate citations by documentId
    const uniqueCitations = Array.from(
      new Map(citations.map((c) => [c.documentId, c])).values()
    );

    console.log(
      `[Chat] Generated response with ${toolCalls} tool calls and ${uniqueCitations.length} citations`
    );
    console.log(`[Chat] Result text length: ${result.text.length}`);
    console.log(`[Chat] Result text: ${result.text}`);
    console.log(`[Chat] Result steps:`, JSON.stringify(result.steps, null, 2));

    // Handle empty response (when LLM only makes tool calls without final text)
    let answer = result.text;
    if (!answer && toolCalls > 0 && uniqueCitations.length > 0) {
      // If we have citations but no answer, the LLM stopped after the first tool call
      // Call get_document to retrieve the full content and try again
      console.log('[Chat] No final answer generated, retrieving full document content...');

      const documentId = uniqueCitations[0].documentId;
      const document = await getDocument(userId, documentId);

      if (document && document.content) {
        // Make another call to the LLM with the document content
        console.log('[Chat] Generating answer with document content...');
        const finalResult = await generateText({
          model: openai.chat("gpt-4o"),
          prompt: `Based on the following document, answer this question: "${question}"

Document: ${document.filename}
Content:
${document.content.substring(0, 10000)}

Please provide a concise answer and cite the document name in your response.`,
        });

        answer = finalResult.text;
      }

      // Fallback if we still don't have an answer
      if (!answer) {
        answer = "I found relevant documents but encountered an issue generating a response. Please try asking your question again.";
      }
    } else if (!answer && toolCalls > 0) {
      answer = "I searched through your documents but couldn't find any information related to your question. Please make sure you've uploaded the relevant documents.";
    }

    return {
      answer,
      citations: uniqueCitations,
      toolCalls,
      toolCallDetails,
      activities,
    };
  } catch (error) {
    console.error("[Chat] Error generating response:", error);
    throw new Error("Failed to generate chat response");
  }
}
