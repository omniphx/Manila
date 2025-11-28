import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

/**
 * AI Configuration for different tasks
 * Each task can use a different model and provider
 */
export const AI_CONFIG = {
  extraction: {
    text: {
      provider: (process.env.LLM_EXTRACTION_TEXT_PROVIDER || 'openai') as 'openai' | 'anthropic',
      model: process.env.LLM_EXTRACTION_TEXT_MODEL || 'gpt-4o-mini',
    },
    vision: {
      provider: (process.env.LLM_EXTRACTION_VISION_PROVIDER || 'openai') as 'openai' | 'anthropic',
      model: process.env.LLM_EXTRACTION_VISION_MODEL || 'gpt-4o',
    },
  },
  embeddings: {
    provider: (process.env.LLM_EMBEDDINGS_PROVIDER || 'openai') as 'openai' | 'anthropic',
    model: process.env.LLM_EMBEDDINGS_MODEL || 'text-embedding-3-small',
  },
  // Add more tasks as needed (summarization, classification, etc.)
} as const;

/**
 * Provider instances (cached)
 */
const providers = {
  openai: createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  anthropic: createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  }),
};

/**
 * Get a model instance for a specific task
 */
export function getModel(task: 'extraction-text' | 'extraction-vision' | 'embeddings') {
  let config;

  switch (task) {
    case 'extraction-text':
      config = AI_CONFIG.extraction.text;
      break;
    case 'extraction-vision':
      config = AI_CONFIG.extraction.vision;
      break;
    case 'embeddings':
      config = AI_CONFIG.embeddings;
      break;
  }

  const provider = providers[config.provider];
  return provider(config.model);
}

/**
 * Get current configuration (for debugging/logging)
 */
export function getAIConfig() {
  return AI_CONFIG;
}
