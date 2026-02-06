/**
 * HTML parsing utilities for extracting content from web pages
 * These are simple regex-based utilities - for complex parsing, consider using a proper HTML parser
 */

export interface ExtractedLink {
  url: string
  text: string
  title?: string
}

export interface ExtractedMeta {
  title?: string
  description?: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonical?: string
}

/**
 * Extract the page title from HTML
 */
export function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match?.[1]?.trim()
}

/**
 * Extract meta information from HTML
 */
export function extractMeta(html: string): ExtractedMeta {
  const meta: ExtractedMeta = {}

  // Title
  meta.title = extractTitle(html)

  // Meta description
  const descMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  )
  meta.description = descMatch?.[1]?.trim()

  // Meta keywords
  const keywordsMatch = html.match(
    /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i,
  )
  if (keywordsMatch?.[1]) {
    meta.keywords = keywordsMatch[1].split(',').map((k) => k.trim())
  }

  // Open Graph
  const ogTitleMatch = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
  )
  meta.ogTitle = ogTitleMatch?.[1]?.trim()

  const ogDescMatch = html.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
  )
  meta.ogDescription = ogDescMatch?.[1]?.trim()

  const ogImageMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  )
  meta.ogImage = ogImageMatch?.[1]?.trim()

  // Canonical URL
  const canonicalMatch = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
  )
  meta.canonical = canonicalMatch?.[1]?.trim()

  return meta
}

/**
 * Extract all links from HTML
 */
export function extractLinks(html: string, baseUrl?: string): ExtractedLink[] {
  const links: ExtractedLink[] = []
  const linkRegex =
    /<a[^>]+href=["']([^"']+)["'][^>]*(?:title=["']([^"']+)["'])?[^>]*>([^<]*(?:<[^/a][^>]*>[^<]*)*)<\/a>/gi

  let match
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]
    const title = match[2]
    // Strip HTML tags from link text
    const text = match[3]?.replace(/<[^>]+>/g, '').trim() ?? ''

    // Skip empty, javascript, mailto, and anchor-only links
    // eslint-disable-next-line no-script-url
    const jsPrefix = 'javascript:'
    if (
      !href ||
      href.startsWith(jsPrefix) ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href === '#'
    ) {
      continue
    }

    // Resolve relative URLs
    let resolvedUrl = href
    if (baseUrl) {
      try {
        resolvedUrl = new URL(href, baseUrl).href
      } catch {
        resolvedUrl = href
      }
    }

    links.push({
      url: resolvedUrl,
      text,
      ...(title && { title }),
    })
  }

  // Deduplicate by URL
  const seen = new Set<string>()
  return links.filter((link) => {
    if (seen.has(link.url)) return false
    seen.add(link.url)
    return true
  })
}

/**
 * Extract text content from HTML, stripping tags
 */
export function extractText(html: string): string {
  return (
    html
      // Remove script and style elements
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Replace block elements with newlines
      .replace(/<\/?(div|p|br|hr|h[1-6]|li|tr|td|th|blockquote)[^>]*>/gi, '\n')
      // Remove remaining HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  )
}

/**
 * Extract content from a specific HTML section using a simple selector
 * Supports: #id, .class, tagname
 */
export function extractSection(
  html: string,
  selector: string,
): string | undefined {
  let regex: RegExp

  if (selector.startsWith('#')) {
    // ID selector
    const id = selector.slice(1)
    regex = new RegExp(
      `<[^>]+id=["']${escapeRegex(id)}["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`,
      'i',
    )
  } else if (selector.startsWith('.')) {
    // Class selector
    const className = selector.slice(1)
    regex = new RegExp(
      `<[^>]+class=["'][^"']*\\b${escapeRegex(className)}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`,
      'i',
    )
  } else {
    // Tag selector
    regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'gi')
  }

  const match = html.match(regex)
  return match?.[0]
}

/**
 * Clean HTML by removing scripts, styles, and comments
 */
export function cleanHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Aggressively strip HTML to reduce token costs
 * Removes navigation, headers, footers, sidebars, ads, and other boilerplate
 * Keeps main content areas
 */
export function stripHtmlForAI(html: string): string {
  let content = html

  // Remove entire elements that are typically not useful for content extraction
  const removeElements = [
    // Scripts, styles, metadata
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<style[^>]*>[\s\S]*?<\/style>/gi,
    /<noscript[^>]*>[\s\S]*?<\/noscript>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
    // Navigation and structural
    /<nav[^>]*>[\s\S]*?<\/nav>/gi,
    /<header[^>]*>[\s\S]*?<\/header>/gi,
    /<footer[^>]*>[\s\S]*?<\/footer>/gi,
    /<aside[^>]*>[\s\S]*?<\/aside>/gi,
    // Common boilerplate classes/IDs
    /<[^>]+(class|id)=["'][^"']*(navbar|nav-|navigation|menu|sidebar|footer|header|cookie|banner|popup|modal|advertisement|ads|social|share|comment|related|breadcrumb)[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi,
    // SVG and canvas (often icons/graphics)
    /<svg[^>]*>[\s\S]*?<\/svg>/gi,
    /<canvas[^>]*>[\s\S]*?<\/canvas>/gi,
    // Forms (usually not content)
    /<form[^>]*>[\s\S]*?<\/form>/gi,
    // iframes
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    // HTML comments
    /<!--[\s\S]*?-->/g,
  ]

  for (const regex of removeElements) {
    content = content.replace(regex, '')
  }

  // Remove all HTML attributes except href, src, alt, title (for context)
  content = content.replace(
    /<([a-z][a-z0-9]*)\s+(?![^>]*(href|src|alt|title)=)[^>]*>/gi,
    '<$1>',
  )

  // Simplify remaining tags - keep only essential attributes
  content = content.replace(
    /<([a-z][a-z0-9]*)[^>]*((?:href|src|alt|title)=["'][^"']*["'])[^>]*>/gi,
    '<$1 $2>',
  )

  // Remove empty elements
  content = content.replace(/<([a-z][a-z0-9]*)[^>]*>\s*<\/\1>/gi, '')

  // Collapse whitespace
  content = content.replace(/\s+/g, ' ')
  content = content.replace(/>\s+</g, '><')

  // Add newlines for readability at block elements
  content = content.replace(
    /<\/(div|p|section|article|li|tr|h[1-6])>/gi,
    '</$1>\n',
  )

  return content.trim()
}

/**
 * Extract main content area from HTML
 * Tries to find <main>, <article>, or content divs
 */
export function extractMainContent(html: string): string {
  // Try to find main content areas in order of preference
  const selectors = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<[^>]+id=["']content["'][^>]*>([\s\S]*?)<\/[^>]+>/i,
    /<[^>]+id=["']main["'][^>]*>([\s\S]*?)<\/[^>]+>/i,
    /<[^>]+class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i,
    /<[^>]+role=["']main["'][^>]*>([\s\S]*?)<\/[^>]+>/i,
  ]

  for (const regex of selectors) {
    const match = html.match(regex)
    if (match?.[1] && match[1].length > 500) {
      // Ensure it's substantial content
      return match[1]
    }
  }

  // Fallback: try to extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch?.[1]) {
    return bodyMatch[1]
  }

  return html
}

/**
 * Convert HTML to a minimal text representation for AI processing
 * Preserves structure using markdown-like formatting
 */
export function htmlToMinimalText(html: string): string {
  let text = html

  // First strip unnecessary elements
  text = stripHtmlForAI(text)

  // Convert headings to markdown-style
  text = text.replace(/<h1[^>]*>([^<]*)<\/h1>/gi, '\n# $1\n')
  text = text.replace(/<h2[^>]*>([^<]*)<\/h2>/gi, '\n## $1\n')
  text = text.replace(/<h3[^>]*>([^<]*)<\/h3>/gi, '\n### $1\n')
  text = text.replace(/<h[4-6][^>]*>([^<]*)<\/h[4-6]>/gi, '\n#### $1\n')

  // Convert links to markdown-style, preserving href
  text = text.replace(
    /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi,
    '[$2]($1)',
  )

  // Convert images to markdown-style
  text = text.replace(
    /<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*?)["'][^>]*\/?>/gi,
    '![$2]($1)',
  )
  text = text.replace(
    /<img[^>]*src=["']([^"']+)["'][^>]*\/?>/gi,
    '![image]($1)',
  )

  // Convert lists
  text = text.replace(/<li[^>]*>/gi, '\n- ')
  text = text.replace(/<\/li>/gi, '')

  // Convert tables to simple format
  text = text.replace(/<tr[^>]*>/gi, '\n')
  text = text.replace(/<t[hd][^>]*>/gi, ' | ')
  text = text.replace(/<\/t[hd]>/gi, '')

  // Convert breaks and paragraphs
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<\/p>/gi, '\n\n')
  text = text.replace(/<p[^>]*>/gi, '')

  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, '')

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/&#\d+;/g, '') // Remove numeric entities we don't handle

  // Normalize whitespace
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n')
  text = text.trim()

  return text
}

/**
 * Truncate HTML content to a maximum length
 */
export function truncateHtml(html: string, maxLength: number): string {
  if (html.length <= maxLength) return html
  return html.slice(0, maxLength) + '\n... [truncated]'
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
