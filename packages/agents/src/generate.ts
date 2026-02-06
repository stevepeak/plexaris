/**
 * Extract detailed error info from an AI SDK APICallError.
 *
 * APICallError properties (statusCode, data, responseBody, etc.) aren't
 * enumerable, so they don't show up in logs or JSON.stringify. This function
 * pulls them out into a plain object.
 */
function extractErrorDetails(error: Error): {
  message: string
  statusCode?: number
  isRetryable?: boolean
  responseBody?: string
  url?: string
  data?: unknown
} {
  const err = error as Error & {
    statusCode?: number
    isRetryable?: boolean
    responseBody?: string
    url?: string
    data?: unknown
  }

  // Try to find the real provider message buried in data.error
  // OpenAI nests it as: data.error.message (short) + data.error.metadata.raw (full JSON)
  let providerMessage: string | undefined
  if (err.data && typeof err.data === 'object') {
    const data = err.data as {
      error?: {
        message?: string
        metadata?: { raw?: string }
      }
    }
    // Try parsing the raw metadata first — it has the most detail
    if (data.error?.metadata?.raw) {
      try {
        const raw = JSON.parse(data.error.metadata.raw) as {
          error?: { message?: string }
        }
        providerMessage = raw.error?.message
      } catch {
        // raw wasn't valid JSON, use it as-is
        providerMessage = data.error.metadata.raw
      }
    }
    // Fall back to the data.error.message if raw didn't yield anything useful
    if (!providerMessage || providerMessage === error.message) {
      providerMessage = data.error?.message
    }
  }

  // Also check responseBody for provider details
  if (!providerMessage && err.responseBody) {
    try {
      const body = JSON.parse(err.responseBody) as {
        error?: { message?: string }
      }
      providerMessage = body.error?.message
    } catch {
      // not JSON
    }
  }

  // Use provider message if it's more specific than the generic error
  const message =
    providerMessage && providerMessage !== error.message
      ? providerMessage
      : error.message

  return {
    message,
    statusCode: err.statusCode,
    isRetryable: err.isRetryable,
    responseBody: err.responseBody,
    url: err.url,
    data: err.data,
  }
}

export class AgentGenerateError extends Error {
  /** HTTP status code from the provider, if available */
  readonly statusCode: number | undefined
  /** Whether the provider considers this retryable */
  readonly isRetryable: boolean | undefined

  constructor(
    message: string,
    opts: {
      cause: unknown
      statusCode?: number
      isRetryable?: boolean
    },
  ) {
    super(message, { cause: opts.cause })
    this.name = 'AgentGenerateError'
    this.statusCode = opts.statusCode
    this.isRetryable = opts.isRetryable
  }
}

/**
 * Wrapper around `agent.generate()` that catches AI SDK errors and re-throws
 * an `AgentGenerateError` with the actual provider error details surfaced.
 *
 * Usage:
 * ```ts
 * const result = await agentGenerate(() => agent.generate({ prompt: '...' }))
 * ```
 */
export async function agentGenerate<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error: unknown) {
    if (error instanceof Error) {
      const details = extractErrorDetails(error)
      throw new AgentGenerateError(details.message, {
        cause: error,
        statusCode: details.statusCode,
        isRetryable: details.isRetryable,
      })
    }

    throw error
  }
}
