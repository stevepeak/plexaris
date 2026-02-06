import { Experimental_Agent as Agent, type ToolSet } from 'ai'
import { z } from 'zod'

export const scrapeOrganizationOutputSchema = z.object({
  organizationId: z.string().describe('The organization that was scraped'),
  fieldsExtracted: z
    .number()
    .describe('Number of fields successfully extracted'),
  issuesCount: z.number().describe('Number of scrape issues encountered'),
  productsDiscovered: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().optional(),
        hint: z.string().optional(),
      }),
    )
    .describe('Products discovered during scraping'),
})

export type ScrapeOrganizationOutput = z.infer<
  typeof scrapeOrganizationOutputSchema
>

export interface ScrapeOrganizationInput {
  model: ConstructorParameters<typeof Agent>[0]['model']
  organizationId: string
  organizationType: 'supplier' | 'horeca'
  urls: string[]
  fileIds: string[]
  tools: ToolSet
  onProgress?: (message: string) => void
}

/**
 * Agent that scrapes URLs and uploaded files to extract organization data
 * (company details, contacts, addresses, etc.) and discovers product listings.
 *
 * The agent uses browserbase tools to navigate and extract from web pages,
 * readFile to access uploaded documents, and queryDatabase to store results.
 */
export async function scrapeOrganizationAgent({
  model,
  organizationId,
  organizationType,
  urls,
  fileIds,
  tools,
  onProgress,
}: ScrapeOrganizationInput): Promise<ScrapeOrganizationOutput> {
  if (onProgress) onProgress('Initializing organization scraping agent...')

  const schemaDescription =
    organizationType === 'supplier'
      ? `Extract supplier company data including:
- headquarters info (company name, address, phone, fax, GLN number, VAT number)
- stock/warehouse location (address, phone, business hours)
- contacts (emergency phone, key account manager, customer service, quality assurance, ordering, logistics, stock contacts — each with name, email, phone, mobile, fax, role)
- banking details (bank name, address, account number, IBAN, BIC)
- delivery specifications for each product (product name, item number, EAN code, tariff number, country of origin, unit of measure details, pallet config, storage requirements, pricing, validity dates)
- distribution centers and central ordering office
- food/allergen information per product
- label copies`
      : `Extract HoReCa establishment data including:
- delivery location info (store number, location name, address, remarks)
- administration details (trade name, invoice address, finance contact, VAT number, CoC number, IBAN)
- contact persons (name, email, phone, mobile, fax, role)
- order info (first delivery date, contact person)
- delivery config (vehicle restrictions, delivery restrictions/time windows, opening hours)`

  const agent = new Agent({
    model,
    system: `You are a data extraction agent that scrapes websites and documents to find company and product information for a ${organizationType} organization.

Your goal is to extract as much structured data as possible from the provided URLs and files.

${schemaDescription}

## Instructions

1. First, fetch the organization from the database using queryDatabase with operation "getOrganization" and params { id: "${organizationId}" } to see what data already exists.

2. For each URL provided, use the "goto" tool to navigate to it, then use "extract" to pull structured data. If a page has links to more detailed pages (like product listings or about pages), use "observe" to find those links and navigate to them.

3. For each file ID provided, use the "readFile" tool to read the uploaded file content and extract relevant information.

4. As you gather data, build up a structured object matching the ${organizationType} schema. For any field where the scraped value doesn't match the expected format, record it as a scrape issue with:
   - source: the URL or filename
   - field: the schema field path (e.g. "info.headquarters.vatNumber")
   - rawValue: the value you found
   - error: why it doesn't match (e.g. "Expected Dutch VAT format NL*B*, got: BE123456789")
   - timestamp: current ISO datetime

5. After extracting all data, update the organization's data column using queryDatabase with operation "updateOrganizationData". Include the scrapeIssues array in the data.

6. While scraping, look for product listings, product pages, or product catalogs. For each product discovered, record its name, URL (if available), and any identifying hint (article number, brand name, etc.).

7. Return the final result with the organization ID, count of fields extracted, issues count, and list of discovered products.

## Important
- Be thorough — navigate sub-pages, follow links to "about", "products", "contact" pages
- Extract ALL available data, even partial matches
- Always record scrape issues rather than silently dropping data
- Prefer hard identifiers (article numbers, GTIN/EAN codes) over soft ones (names)`,
    tools,
    onStepFinish: ({ text }) => {
      if (onProgress && text) {
        onProgress(text.slice(0, 200))
      }
    },
  })

  const result = await agent.generate({
    prompt: `Scrape the following sources for organization ${organizationId} (type: ${organizationType}):

URLs to scrape:
${urls.length > 0 ? urls.map((u) => `- ${u}`).join('\n') : '(none)'}

File IDs to read:
${fileIds.length > 0 ? fileIds.map((f) => `- ${f}`).join('\n') : '(none)'}

Extract all company/organization data you can find, store it in the database, and report back what you found including any products discovered.`,
  })

  // Parse the agent's final text output into structured data
  // The agent should return JSON matching our output schema
  try {
    const parsed = scrapeOrganizationOutputSchema.parse(
      JSON.parse(extractJson(result.text)),
    )
    return parsed
  } catch {
    // If the agent couldn't produce valid structured output, return a default
    return {
      organizationId,
      fieldsExtracted: 0,
      issuesCount: 0,
      productsDiscovered: [],
    }
  }
}

/** Extract the first JSON object from a string that may contain prose around it */
function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/)
  return match?.[0] ?? '{}'
}
