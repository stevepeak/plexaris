import { tool } from 'ai'
import { z } from 'zod'

import { fetchPage, type HttpRequestOptions } from './client'
import {
  extractLinks,
  extractMainContent,
  extractMeta,
  htmlToMinimalText,
  stripHtmlForAI,
  truncateHtml,
} from './html'

export interface HttpToolsContext {
  onProgress?: (message: string) => void
  /** Default request options */
  defaultOptions?: Omit<HttpRequestOptions, 'method' | 'body'>
  /** Store for the current page content */
  pageContent: {
    url: string | null
    html: string | null
    text: string | null
  }
}

/**
 * Create a context for HTTP tools with shared state
 */
export function createHttpContext(options?: {
  onProgress?: (message: string) => void
  defaultOptions?: Omit<HttpRequestOptions, 'method' | 'body'>
}): HttpToolsContext {
  return {
    onProgress: options?.onProgress,
    defaultOptions: options?.defaultOptions,
    pageContent: {
      url: null,
      html: null,
      text: null,
    },
  }
}

/**
 * Tool to fetch a webpage
 * Returns page metadata and stores content for extraction
 */
export function createFetchPageTool(ctx: HttpToolsContext) {
  return tool({
    description:
      'Fetch a webpage via HTTP. Returns page metadata (title, description, links). Use getPageContent to retrieve the actual page content for analysis.',
    inputSchema: z.object({
      url: z
        .string()
        .url()
        .describe('The URL to fetch (e.g., "https://example.com/products")'),
    }),
    execute: async (input: { url: string }) => {
      ctx.onProgress?.(`Fetching ${input.url}`)

      try {
        const response = await fetchPage(input.url, ctx.defaultOptions)

        if (response.status >= 400) {
          return JSON.stringify({
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
            url: input.url,
          })
        }

        // Store content for later extraction
        ctx.pageContent.url = response.url
        ctx.pageContent.html = response.body

        // Extract main content and convert to minimal text
        const mainContent = extractMainContent(response.body)
        const strippedContent = stripHtmlForAI(mainContent)
        ctx.pageContent.text = htmlToMinimalText(strippedContent)

        // Extract metadata
        const meta = extractMeta(response.body)
        const links = extractLinks(response.body, response.url)

        // Group links by type
        const productLinks = links.filter(
          (l) =>
            /product|item|sku|article/i.test(l.url) ||
            /product|item|buy|shop/i.test(l.text),
        )
        const categoryLinks = links.filter(
          (l) =>
            /categor|collect|department/i.test(l.url) ||
            /categor|collect|all|browse/i.test(l.text),
        )
        const navLinks = links
          .filter(
            (l) =>
              /about|contact|faq|help|terms|privacy/i.test(l.url) ||
              /about|contact|help/i.test(l.text),
          )
          .slice(0, 10)

        return JSON.stringify({
          success: true,
          url: response.url,
          redirected: response.redirected,
          meta: {
            title: meta.title,
            description: meta.description ?? meta.ogDescription,
          },
          contentLength: ctx.pageContent.text.length,
          links: {
            products: productLinks.slice(0, 20),
            categories: categoryLinks.slice(0, 10),
            navigation: navLinks,
            total: links.length,
          },
        })
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
          url: input.url,
        })
      }
    },
  })
}

/**
 * Tool to get the page content in a token-efficient format
 */
export function createGetPageContentTool(ctx: HttpToolsContext) {
  return tool({
    description:
      'Get the content of the currently fetched page. Returns the main content as minimal text, optimized for AI processing. Use after fetchPage.',
    inputSchema: z.object({
      maxLength: z
        .number()
        .optional()
        .describe(
          'Maximum content length to return (default: 50000 characters). Use smaller values for quick scans.',
        ),
      format: z
        .enum(['text', 'html'])
        .optional()
        .describe(
          'Content format: "text" for minimal text (default, lower tokens), "html" for stripped HTML',
        ),
    }),
    execute: (input: { maxLength?: number; format?: 'text' | 'html' }) => {
      if (!ctx.pageContent.url) {
        return JSON.stringify({
          error: 'No page content available. Use fetchPage first.',
        })
      }

      ctx.onProgress?.('Retrieving page content')

      const maxLength = input.maxLength ?? 50000
      const format = input.format ?? 'text'

      let content: string
      if (format === 'html') {
        content = ctx.pageContent.html
          ? stripHtmlForAI(extractMainContent(ctx.pageContent.html))
          : ''
      } else {
        content = ctx.pageContent.text ?? ''
      }

      return JSON.stringify({
        url: ctx.pageContent.url,
        format,
        content: truncateHtml(content, maxLength),
        truncated: content.length > maxLength,
        originalLength: content.length,
      })
    },
  })
}

/**
 * Tool to extract links from the current page with filtering
 */
export function createGetLinksTool(ctx: HttpToolsContext) {
  return tool({
    description:
      'Get links from the currently fetched page. Filter by text or URL pattern to find product pages, categories, or specific sections.',
    inputSchema: z.object({
      filter: z
        .string()
        .optional()
        .describe(
          'Text to filter links by (matches URL or link text). E.g., "product", "category", "detail"',
        ),
      limit: z
        .number()
        .optional()
        .describe('Maximum number of links to return (default: 50)'),
    }),
    execute: (input: { filter?: string; limit?: number }) => {
      if (!ctx.pageContent.html || !ctx.pageContent.url) {
        return JSON.stringify({
          error: 'No page content available. Use fetchPage first.',
        })
      }

      ctx.onProgress?.(
        `Finding links${input.filter ? ` matching "${input.filter}"` : ''}`,
      )

      let links = extractLinks(ctx.pageContent.html, ctx.pageContent.url)

      // Apply filter if provided
      if (input.filter) {
        const filterLower = input.filter.toLowerCase()
        links = links.filter(
          (l) =>
            l.url.toLowerCase().includes(filterLower) ||
            l.text.toLowerCase().includes(filterLower),
        )
      }

      const limit = input.limit ?? 50

      return JSON.stringify({
        url: ctx.pageContent.url,
        filter: input.filter ?? null,
        links: links.slice(0, limit),
        total: links.length,
        limited: links.length > limit,
      })
    },
  })
}

/**
 * Tool to search for specific text/patterns in the page content
 */
export function createSearchContentTool(ctx: HttpToolsContext) {
  return tool({
    description:
      'Search the current page content for specific text or patterns. Returns matching sections with surrounding context.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('Text to search for in the page content (case-insensitive)'),
      contextLines: z
        .number()
        .optional()
        .describe('Number of lines of context around each match (default: 2)'),
    }),
    execute: (input: { query: string; contextLines?: number }) => {
      if (!ctx.pageContent.text) {
        return JSON.stringify({
          error: 'No page content available. Use fetchPage first.',
        })
      }

      ctx.onProgress?.(`Searching for "${input.query}"`)

      const contextLines = input.contextLines ?? 2
      const lines = ctx.pageContent.text.split('\n')
      const queryLower = input.query.toLowerCase()
      const matches: { lineNumber: number; context: string }[] = []

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(queryLower)) {
          const start = Math.max(0, i - contextLines)
          const end = Math.min(lines.length, i + contextLines + 1)
          const context = lines.slice(start, end).join('\n')
          matches.push({ lineNumber: i + 1, context })
        }
      }

      return JSON.stringify({
        url: ctx.pageContent.url,
        query: input.query,
        matches: matches.slice(0, 20), // Limit to 20 matches
        total: matches.length,
      })
    },
  })
}

/**
 * Create all HTTP tools with a shared context
 */
export function createHttpTools(options?: {
  onProgress?: (message: string) => void
  defaultOptions?: Omit<HttpRequestOptions, 'method' | 'body'>
}) {
  const ctx = createHttpContext(options)

  return {
    fetchPage: createFetchPageTool(ctx),
    getPageContent: createGetPageContentTool(ctx),
    getLinks: createGetLinksTool(ctx),
    searchContent: createSearchContentTool(ctx),
  }
}
