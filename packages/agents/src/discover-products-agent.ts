import { Experimental_Agent as Agent, Output, type ToolSet } from 'ai'
import { dedent } from 'ts-dedent'
import { z } from 'zod'

import { agentGenerate } from './generate'
import { createModel } from './model'

export const discoverProductsOutputSchema = z.object({
  organizationId: z.string().describe('The organization that was scraped'),
  productsDiscovered: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().nullable(),
        hint: z.string().nullable(),
      }),
    )
    .describe('Products discovered during scraping'),
})

export type DiscoverProductsOutput = z.infer<
  typeof discoverProductsOutputSchema
>

export interface DiscoverProductsInput {
  modelId?: string
  organizationId: string
  url?: string
  fileId?: string
  tools: ToolSet
  onProgress?: (message: string) => void
}

/**
 * Agent that discovers products from URLs and uploaded files.
 *
 * The agent uses HTTP scraping tools to navigate web pages and readFile
 * to access uploaded documents. It is side-effect-free (no database writes).
 */
export async function discoverProductsAgent({
  modelId,
  organizationId,
  url,
  fileId,
  tools,
  onProgress,
}: DiscoverProductsInput): Promise<DiscoverProductsOutput> {
  if (onProgress) onProgress('Initializing product discovery agent...')

  const agent = new Agent({
    model: createModel(modelId),
    instructions: dedent`
      You are a product discovery agent that scrapes supplier websites and documents to find product listings.

      Your goal is to discover as many products as possible from the provided URLs and files. You do NOT extract detailed product data — you only identify products and record basic references for follow-up scraping.

      ## Instructions

      1. If a URL is provided:
         a. Use "fetchPage" to fetch the URL — this returns page metadata and categorized links
         b. Use "getPageContent" to retrieve the main content (optimized for token efficiency)
         c. Use "getLinks" with filters like "product", "catalog", "assortment" to find product listing pages
         d. Follow relevant links to find product catalogs, price lists, and assortment pages
         e. Use "searchContent" to find product names, article numbers, EAN codes, etc.

      2. If a file ID is provided, use the "readFile" tool to read the uploaded file content and identify product listings.

      3. For each product discovered, record:
         - name: the product name
         - url: the product page URL (if available)
         - hint: any identifying information such as article number, brand name, EAN/GTIN code

      ## Important
      - Plan your exploration strategy based on the links returned by fetchPage
      - Look for product listing pages, catalogs, price lists, assortment overviews
      - Prefer hard identifiers (article numbers, GTIN/EAN codes) over soft ones (names) for hints
      - Cast a wide net — it's better to discover too many products than too few
      - Do NOT attempt to extract detailed product data (dimensions, allergens, etc.)
    `,
    tools,
    output: Output.object({
      schema: discoverProductsOutputSchema,
    }),
  })

  const result = await agentGenerate(() =>
    agent.generate({
      prompt: dedent`
        Discover products from the following source for organization ${organizationId}:

        ${url ? `URL: ${url}` : `File ID: ${fileId}`}

        Find all product listings, catalogs, and price lists. Record each product's name, URL, and any identifying hint.
      `,
      onStepFinish: ({ text }) => {
        if (onProgress && text) {
          onProgress(text.slice(0, 200))
        }
      },
    }),
  )

  return result.output
}
