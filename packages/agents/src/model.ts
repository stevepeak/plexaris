import { getConfig } from '@app/config'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { type LanguageModel } from 'ai'

export const DEFAULT_MODEL = 'openai/gpt-5-mini'

/**
 * Creates an OpenRouter AI model instance.
 *
 * @param modelId - The model identifier (default: 'openai/gpt-5-mini')
 * @returns The AI model instance ready to use with agents
 */
export function createModel(modelId: string = DEFAULT_MODEL): LanguageModel {
  const config = getConfig()
  const openrouter = createOpenRouter({
    apiKey: config.OPENROUTER_API_KEY,
  })
  return openrouter(modelId)
}
