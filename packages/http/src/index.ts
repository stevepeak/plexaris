export {
  fetchPage,
  httpRequest,
  type HttpRequestOptions,
  type HttpResponse,
} from './client'

export {
  cleanHtml,
  type ExtractedLink,
  type ExtractedMeta,
  extractLinks,
  extractMainContent,
  extractMeta,
  extractSection,
  extractText,
  extractTitle,
  htmlToMinimalText,
  stripHtmlForAI,
  truncateHtml,
} from './html'

export {
  createFetchPageTool,
  createGetLinksTool,
  createGetPageContentTool,
  createHttpContext,
  createHttpTools,
  createSearchContentTool,
  type HttpToolsContext,
} from './tools'
