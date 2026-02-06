import { Experimental_Agent as Agent, Output, type ToolSet } from 'ai'
import { dedent } from 'ts-dedent'
import { z } from 'zod'

import { agentGenerate } from './generate'
import { createModel } from './model'

const scrapeIssueSchema = z.object({
  source: z.string().describe('The URL or filename where the issue was found'),
  field: z
    .string()
    .describe('The schema field path (e.g. "info.headquarters.vatNumber")'),
  rawValue: z.string().describe('The raw value that was found'),
  error: z.string().describe("Why it doesn't match the expected format"),
  timestamp: z.string().describe('ISO datetime of when the issue was recorded'),
})

/** Internal schema used for OpenAI structured output (data as JSON string). */
const agentOutputSchema = z.object({
  organizationId: z.string().describe('The organization that was scraped'),
  data: z
    .string()
    .describe(
      'The full extracted organization data as a JSON-encoded string (e.g. \'{"name":"Acme"}\')',
    ),
  issues: z
    .array(scrapeIssueSchema)
    .describe('All scrape issues encountered during extraction'),
})

export interface ScrapeOrganizationOutput {
  organizationId: string
  data: Record<string, unknown>
  issues: z.infer<typeof scrapeIssueSchema>[]
}

export interface ScrapeOrganizationInput {
  modelId?: string
  organizationId: string
  organizationType: 'supplier' | 'horeca'
  urls: string[]
  fileIds: string[]
  tools: ToolSet
  onProgress?: (message: string) => void
}

/**
 * Agent that scrapes URLs and uploaded files to extract organization data
 * (company details, contacts, addresses, etc.).
 *
 * The agent creates suggestions for actionable changes (phone, email, address, etc.)
 * and also returns the full data blob for the trigger task to persist.
 */
export async function scrapeOrganizationAgent({
  modelId,
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
      ? dedent`
          Extract supplier company data including:
          - headquarters info (company name, address, phone, fax, GLN number, VAT number)
          - stock/warehouse location (address, phone, business hours)
          - contacts (emergency phone, key account manager, customer service, quality assurance, ordering, logistics, stock contacts — each with name, email, phone, mobile, fax, role)
          - banking details (bank name, address, account number, IBAN, BIC)
          - delivery specifications for each product (product name, item number, EAN code, tariff number, country of origin, unit of measure details, pallet config, storage requirements, pricing, validity dates)
          - distribution centers and central ordering office
          - food/allergen information per product
          - label copies
        `
      : dedent`
          Extract HoReCa establishment data including:
          - delivery location info (store number, location name, address, remarks)
          - administration details (trade name, invoice address, finance contact, VAT number, CoC number, IBAN)
          - contact persons (name, email, phone, mobile, fax, role)
          - order info (first delivery date, contact person)
          - delivery config (vehicle restrictions, delivery restrictions/time windows, opening hours)
        `

  const agent = new Agent({
    model: createModel(modelId),
    instructions: dedent`
      You are a data extraction agent that scrapes websites and documents to find company information for a ${organizationType} organization.

      Your goal is to extract as much structured data as possible from the provided URLs and files.

      ${schemaDescription}

      ## Instructions

      1. For each URL provided:
         a. Use "fetchPage" to fetch the URL - this returns page metadata and categorized links
         b. Use "getPageContent" to retrieve the main content (optimized for token efficiency)
         c. Analyze the content to extract relevant data fields
         d. Use "getLinks" with filters like "product", "about", "contact" to find related pages worth exploring
         e. Follow relevant links to gather more data

      2. For each file ID provided, use the "readFile" tool to read the uploaded file content and extract relevant information.

      3. As you gather data, build up a structured object matching the ${organizationType} schema. For any field where the scraped value doesn't match the expected format, record it as a scrape issue with:
         - source: the URL or filename
         - field: the schema field path (e.g. "info.headquarters.vatNumber")
         - rawValue: the value you found
         - error: why it doesn't match (e.g. "Expected Dutch VAT format NL*B*, got: BE123456789")
         - timestamp: current ISO datetime

      4. Create suggestions for actionable organization changes using "suggestOrganization":
         - Use action "update_field" for each top-level field you discover (phone, email, address, etc.)
         - Use action "update" for the full data JSONB blob with all extracted details
         - Always set confidence ("high", "medium", "low") based on data quality
         - Always set source to the URL or file ID
         - Always provide reasoning explaining how you determined the value

      5. Return the final result with the organization ID, the full extracted data object, and the complete issues array.

      ## Important
      - Plan your exploration strategy based on the links returned by fetchPage
      - Use "searchContent" to find specific information (prices, phone numbers, emails, etc.)
      - Extract ALL available data, even partial matches
      - Always record scrape issues rather than silently dropping data
      - Prefer hard identifiers (article numbers, GTIN/EAN codes) over soft ones (names)
    `,
    tools,
    output: Output.object({
      schema: agentOutputSchema,
    }),
  })

  const result = await agentGenerate(() =>
    agent.generate({
      prompt: dedent`
        Scrape the following sources for organization ${organizationId} (type: ${organizationType}):

        URLs to scrape:
        ${urls.length > 0 ? urls.map((u) => `- ${u}`).join('\n') : '(none)'}

        File IDs to read:
        ${fileIds.length > 0 ? fileIds.map((f) => `- ${f}`).join('\n') : '(none)'}

        Extract all company/organization data you can find, create suggestions for actionable changes using suggestOrganization, and report back what you found.
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
    organizationId: raw.organizationId,
    data: JSON.parse(raw.data) as Record<string, unknown>,
    issues: raw.issues,
  }
}
