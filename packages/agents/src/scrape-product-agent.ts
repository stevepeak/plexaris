import { Experimental_Agent as Agent, Output, type ToolSet } from 'ai'
import { dedent } from 'ts-dedent'
import { z } from 'zod'

import { agentGenerate } from './generate'
import { createModel } from './model'

const scrapeIssueSchema = z.object({
  source: z.string().describe('The URL or filename where the issue was found'),
  field: z.string().describe('The schema field path (e.g. "unit.gtin")'),
  rawValue: z.string().describe('The raw value that was found'),
  error: z.string().describe("Why it doesn't match the expected format"),
  timestamp: z.string().describe('ISO datetime of when the issue was recorded'),
})

/** Internal schema used for OpenAI structured output (data as JSON string). */
const agentOutputSchema = z.object({
  productName: z.string().describe('The product name'),
  suggestionsCreated: z
    .number()
    .describe('Number of suggestions created by the agent'),
  data: z
    .string()
    .describe(
      'The full extracted product data as a JSON-encoded string (e.g. \'{"brand":"Acme"}\')',
    ),
  issues: z
    .array(scrapeIssueSchema)
    .describe('All scrape issues encountered during extraction'),
})

export interface ScrapeProductOutput {
  productName: string
  suggestionsCreated: number
  data: Record<string, unknown>
  issues: z.infer<typeof scrapeIssueSchema>[]
}

export interface ScrapeProductInput {
  modelId?: string
  organizationId: string
  productUrl?: string
  fileId?: string
  productHint: string
  tools: ToolSet
  onProgress?: (message: string) => void
}

/**
 * Agent that scrapes a product page or file to extract product data,
 * then creates suggestions for human review rather than directly modifying the database.
 *
 * Deduplication strategy:
 * - Match by articleNumber or unit.gtin (hard identifiers)
 * - If match found: suggest update_field per changed field
 * - If no match: suggest create with full product data
 * - Same name but different numbers = distinct products
 */
export async function scrapeProductAgent({
  modelId,
  organizationId,
  productUrl,
  fileId,
  productHint,
  tools,
  onProgress,
}: ScrapeProductInput): Promise<ScrapeProductOutput> {
  if (onProgress) onProgress(`Scraping product: ${productHint}`)

  const agent = new Agent({
    model: createModel(modelId),
    instructions: dedent`
      You are a product data extraction agent. You scrape a single product page or document section to extract detailed product information.

      ## Product Schema
      Top-level DB columns (set directly when creating/updating):
      - name: Product name (required)
      - description: Product description
      - price: Product price
      - unit: Unit of measure (kg, piece, liter, box)
      - category: Product category

      Additional fields stored in the data jsonb column:
      - brand: Product brand name
      - variant: Product variant or flavour
      - intrastatCode: 8-digit Intrastat/CN commodity code
      - articleNumber: Distributor article number (CRITICAL for deduplication)
      - countryOfOrigin: ISO 3166-1 alpha-2 country code
      - unit: Individual unit details (gtin/EAN code, dimensions in mm, weight in grams, net content, packaging type, packshot URLs)
      - case: Case/tray details (gtin, dimensions, weight, units per case, net content, packaging type)
      - pallet: Pallet configuration (gtin, pallet type euro/chep, load layout, dimensions in cm, weight in kg)
      - productInfo: Ingredients list, nutritional values per 100g/ml, allergen information

      ## Deduplication Strategy
      Before creating suggestions, check if the product already exists:
      1. If you found an articleNumber, use "searchProduct" with the articleNumber
      2. If you found a unit GTIN/EAN, use "searchProduct" with the gtin
      3. If a match is found, use "suggestProduct" with action "update_field" for each changed field
      4. If no match is found, use "suggestProduct" with action "create" and the full product data blob in proposedValue

      IMPORTANT: Name alone is NOT sufficient for deduplication. Same name + different article numbers = different products.

      ## Creating Suggestions
      Instead of directly creating or updating products, you create suggestions for human review:
      - For NEW products: call "suggestProduct" with action "create", proposedValue containing ALL product data (name, description, price, unit, category, plus data blob)
      - For EXISTING products: call "suggestProduct" with action "update_field" once per changed field, including field path, currentValue, and proposedValue
      - Always set confidence ("high", "medium", "low") based on data quality
      - Always set source to the URL or file ID
      - Always provide reasoning explaining how you determined the value

      ## Scrape Issues
      For any field where the scraped value doesn't match the expected format, record a scrape issue:
      - source: the URL or filename
      - field: the schema field path (e.g. "unit.gtin")
      - rawValue: the value you found
      - error: why it doesn't match
      - timestamp: current ISO datetime

      ## Instructions
      1. If a URL is provided:
         a. Use "fetchPage" to fetch the URL and get page metadata
         b. Use "getPageContent" to retrieve the page content (token-optimized)
         c. Use "searchContent" to find specific product fields (GTIN, prices, dimensions, etc.)
         d. Extract product data from the content
      2. If a file ID is provided, use "readFile" to read the file and extract product data
      3. Check for existing product via articleNumber or GTIN using "searchProduct"
      4. Create suggestions using "suggestProduct" for each proposed change
      5. Return the result with productName, suggestionsCreated count, the full extracted data object, and the complete issues array
    `,
    tools,
    output: Output.object({
      schema: agentOutputSchema,
    }),
  })

  const result = await agentGenerate(() =>
    agent.generate({
      prompt: dedent`
        Extract product data for organization ${organizationId}.
        Product hint: "${productHint}"
        ${productUrl ? `Product URL: ${productUrl}` : ''}
        ${fileId ? `File ID: ${fileId}` : ''}

        Scrape the product information, deduplicate against existing products using searchProduct, and create suggestions using suggestProduct for human review.
      `,
      onStepFinish: ({ text }) => {
        if (onProgress && text) {
          onProgress(text.slice(0, 200))
        }
      },
    }),
  )

  const raw = result.output
  return {
    productName: raw.productName,
    suggestionsCreated: raw.suggestionsCreated,
    data: JSON.parse(raw.data) as Record<string, unknown>,
    issues: raw.issues,
  }
}
