import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { env } from '../lib/env.js';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DocumentContext {
  filename: string;
  content: string;
}

/**
 * Generate a chat response using Claude with document context
 */
export async function generateChatResponse(
  userMessage: string,
  conversationHistory: ChatMessage[],
  documents: DocumentContext[] = []
): Promise<string> {
  // Build system message with document context
  let systemMessage = 'You are Manila, an AI assistant that helps users understand and analyze their uploaded documents.';

  if (documents.length > 0) {
    systemMessage += '\n\nYou have access to the following documents:\n';
    documents.forEach((doc, idx) => {
      systemMessage += `\n### Document ${idx + 1}: ${doc.filename}\n`;
      systemMessage += `${doc.content.slice(0, 4000)}${doc.content.length > 4000 ? '...' : ''}\n`;
    });
    systemMessage += '\n\nWhen answering questions, reference specific information from these documents when relevant. If the answer cannot be found in the provided documents, let the user know.';
  } else {
    systemMessage += ' Currently, no documents have been uploaded. You can help users understand how to use the system or have general conversations.';
  }

  // Convert conversation history to AI SDK format
  const messages = [
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: userMessage,
    },
  ];

  try {
    const result = await generateText({
      model: openai('gpt-4o'),
      system: systemMessage,
      messages,
      maxTokens: 2048,
    });

    return result.text;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate chat response');
  }
}

/**
 * Generate citations for a response based on document context
 * This is a placeholder - in a real implementation, you would use embeddings
 * and similarity search to find relevant document sections
 */
export async function generateCitations(
  response: string,
  documents: DocumentContext[]
): Promise<Array<{ filename: string; page: number; relevance: number }>> {
  // Placeholder implementation
  // In a real system, this would:
  // 1. Use embeddings to find relevant sections of documents
  // 2. Match those sections to parts of the response
  // 3. Return structured citations with page numbers

  if (documents.length === 0) {
    return [];
  }

  // For now, return a simple citation to the first document
  return [
    {
      filename: documents[0].filename,
      page: 1,
      relevance: 0.8,
    },
  ];
}
