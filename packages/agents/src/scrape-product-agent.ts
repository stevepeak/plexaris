import { Experimental_Agent as Agent, type ToolSet } from 'ai'
import { z } from 'zod'

export const scrapeProductOutputSchema = z.object({
  productId: z.string().nullable().describe('The product ID (new or existing)'),
  productName: z.string().describe('The product name'),
  isNew: z.boolean().describe('Whether a new product was created'),
  fieldsExtracted: z
    .number()
    .describe('Number of fields successfully extracted'),
  issuesCount: z.number().describe('Number of scrape issues encountered'),
})

export type ScrapeProductOutput = z.infer<typeof scrapeProductOutputSchema>

export interface ScrapeProductInput {
  model: ConstructorParameters<typeof Agent>[0]['model']
  organizationId: string
  productUrl?: string
  fileId?: string
  productHint: string
  tools: ToolSet
  onProgress?: (message: string) => void
}

/**
 * Agent that scrapes a product page or file to extract product data,
 * then deduplicates and upserts the product into the database.
 *
 * Deduplication strategy:
 * - Match by articleNumber or unit.gtin (hard identifiers)
 * - If match found: update existing product's data with new/richer fields
 * - If no match: insert new product
 * - Same name but different numbers = distinct products
 */
export async function scrapeProductAgent({
  model,
  organizationId,
  productUrl,
  fileId,
  productHint,
  tools,
  onProgress,
}: ScrapeProductInput): Promise<ScrapeProductOutput> {
  if (onProgress) onProgress(`Scraping product: ${productHint}`)

  const agent = new Agent({
    model,
    system: `You are a product data extraction agent. You scrape a single product page or document section to extract detailed product information.

## Product Schema Fields
Extract as many of these fields as possible:
- brand: Product brand name
- variant: Product variant or flavour
- intrastatCode: 8-digit Intrastat/CN commodity code
- articleNumber: Distributor article number (CRITICAL for deduplication)
- countryOfOrigin: ISO 3166-1 alpha-2 country code
- description: Product description
- unit: Individual unit details (gtin/EAN code, dimensions in mm, weight in grams, net content, packaging type, packshot URLs)
- case: Case/tray details (gtin, dimensions, weight, units per case, net content, packaging type)
- pallet: Pallet configuration (gtin, pallet type euro/chep, load layout, dimensions in cm, weight in kg)
- productInfo: Ingredients list, nutritional values per 100g/ml, allergen information

## Deduplication Strategy
Before inserting a product, check if it already exists:
1. If you found an articleNumber, use queryDatabase operation "findProductByArticleNumber"
2. If you found a unit GTIN/EAN, use queryDatabase operation "findProductByGtin"
3. If a match is found, update the existing product's data with any new/richer fields using "updateProductData"
4. If no match is found, create a new product using "upsertProduct"

IMPORTANT: Name alone is NOT sufficient for deduplication. Same name + different article numbers = different products.

## Scrape Issues
For any field where the scraped value doesn't match the expected format, record a scrape issue:
- source: the URL or filename
- field: the schema field path (e.g. "unit.gtin")
- rawValue: the value you found
- error: why it doesn't match
- timestamp: current ISO datetime

Store all issues in the product's data.scrapeIssues array.

## Instructions
1. If a URL is provided, use "goto" to navigate to it, then "extract" to pull product data
2. If a file ID is provided, use "readFile" to read the file and extract product data
3. Check for existing product via articleNumber or GTIN
4. Insert or update the product in the database
5. Return the result with productId, name, whether it's new, fields extracted, and issues count`,
    tools,
    onStepFinish: ({ text }) => {
      if (onProgress && text) {
        onProgress(text.slice(0, 200))
      }
    },
  })

  const result = await agent.generate({
    prompt: `Extract product data for organization ${organizationId}.
Product hint: "${productHint}"
${productUrl ? `Product URL: ${productUrl}` : ''}
${fileId ? `File ID: ${fileId}` : ''}

Scrape the product information, deduplicate against existing products, and store the result in the database.`,
  })

  try {
    const parsed = scrapeProductOutputSchema.parse(
      JSON.parse(extractJson(result.text)),
    )
    return parsed
  } catch {
    return {
      productId: null,
      productName: productHint,
      isNew: false,
      fieldsExtracted: 0,
      issuesCount: 0,
    }
  }
}

function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/)
  return match?.[0] ?? '{}'
}
