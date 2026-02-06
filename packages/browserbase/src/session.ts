import { Stagehand } from '@browserbasehq/stagehand'

import {
  type BrowserbaseToolsContext,
  createActTool,
  createAgentTool,
  createExtractTool,
  createGotoTool,
  createObserveTool,
} from './tools'

export interface CreateSessionOptions {
  apiKey: string
  modelName: string
  modelClientOptions: { apiKey: string }
  onProgress?: (message: string) => void
}

export interface BrowserSession {
  context: BrowserbaseToolsContext
  tools: {
    goto: ReturnType<typeof createGotoTool>
    extract: ReturnType<typeof createExtractTool>
    observe: ReturnType<typeof createObserveTool>
    act: ReturnType<typeof createActTool>
    agent: ReturnType<typeof createAgentTool>
  }
  close: () => Promise<void>
}

/**
 * Creates a Stagehand browser session and returns the context, tools, and a
 * close function. This centralizes Stagehand initialization so consumers
 * don't need to import `@browserbasehq/stagehand` directly.
 */
export async function createBrowserSession(
  options: CreateSessionOptions,
): Promise<BrowserSession> {
  const stagehand = new Stagehand({
    apiKey: options.apiKey,
    env: 'BROWSERBASE',
    model: {
      modelName: options.modelName as 'gpt-4o',
      ...options.modelClientOptions,
    },
  })
  await stagehand.init()

  const context: BrowserbaseToolsContext = {
    stagehand,
    agent: stagehand.agent({}),
    onProgress: options.onProgress,
  }

  return {
    context,
    tools: {
      goto: createGotoTool(context),
      extract: createExtractTool(context),
      observe: createObserveTool(context),
      act: createActTool(context),
      agent: createAgentTool(context),
    },
    close: () => stagehand.close(),
  }
}
