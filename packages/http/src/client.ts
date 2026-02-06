export interface HttpRequestOptions {
  /** HTTP method (default: GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  /** Request headers */
  headers?: Record<string, string>
  /** Request body (for POST/PUT/PATCH) */
  body?: string | Record<string, unknown>
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
  /** Follow redirects (default: true) */
  followRedirects?: boolean
  /** Maximum redirects to follow (default: 5) */
  maxRedirects?: number
}

export interface HttpResponse {
  /** HTTP status code */
  status: number
  /** Status text */
  statusText: string
  /** Response headers */
  headers: Record<string, string>
  /** Response body as text */
  body: string
  /** Final URL after redirects */
  url: string
  /** Whether the response was redirected */
  redirected: boolean
}

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent': DEFAULT_USER_AGENT,
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
}

/**
 * Simple HTTP client for fetching web pages
 */
export async function httpRequest(
  url: string,
  options: HttpRequestOptions = {},
): Promise<HttpResponse> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000,
    followRedirects = true,
    maxRedirects = 5,
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const requestHeaders = {
      ...DEFAULT_HEADERS,
      ...headers,
    }

    let requestBody: string | undefined
    if (body) {
      if (typeof body === 'string') {
        requestBody = body
      } else {
        requestBody = JSON.stringify(body)
        requestHeaders['Content-Type'] = 'application/json'
      }
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
      redirect: followRedirects ? 'follow' : 'manual',
    })

    // Check redirect count (fetch handles this internally, but we track for info)
    const redirectCount = response.redirected ? 1 : 0
    if (redirectCount > maxRedirects) {
      throw new Error(`Too many redirects (max: ${maxRedirects})`)
    }

    const responseBody = await response.text()
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      url: response.url,
      redirected: response.redirected,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Fetch a webpage and return its HTML content
 */
export async function fetchPage(
  url: string,
  options: Omit<HttpRequestOptions, 'method' | 'body'> = {},
): Promise<HttpResponse> {
  return httpRequest(url, { ...options, method: 'GET' })
}
