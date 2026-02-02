import { logger, task } from '@trigger.dev/sdk'
import { z } from 'zod'

import { seedSuppliersTask } from './seed-suppliers'

const BASE_URL = 'https://www.horecava.nl'
const LIST_API = `${BASE_URL}/api/events/75/exhibitors`
const DETAIL_PATH = '/en/exhibitors'
const BATCH_SIZE = 10
const DELAY_MS = 500

const listItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  countryCode: z.string().optional(),
  logo: z.string().optional(),
  stands: z.array(z.string()).optional(),
  eventId: z.string().optional(),
})

interface Exhibitor {
  id: number
  slug: string
  name: string
  description: string | null
  longDescription: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  countryCode: string | null
  logo: string | null
  stands: string[]
}

async function fetchExhibitorList(): Promise<z.infer<typeof listItemSchema>[]> {
  const url = `${LIST_API}?query=&letter=&page=1&sort=slug&showalllogos=1&categories=&premium=&segment=&limit=1000`

  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Plexaris-Scraper/1.0 (supplier-outreach)' },
  })

  if (!resp.ok) {
    throw new Error(`List API returned ${resp.status}: ${resp.statusText}`)
  }

  const data = (await resp.json()) as {
    exhibitors: unknown[]
    totalCount: number
  }
  logger.log('Fetched exhibitor list', {
    totalCount: data.totalCount,
    returned: data.exhibitors.length,
  })

  return data.exhibitors.map((item) => listItemSchema.parse(item))
}

async function fetchExhibitorDetail(slug: string): Promise<{
  website: string | null
  address: string | null
  longDescription: string | null
  email: string | null
  phone: string | null
}> {
  const url = `${BASE_URL}${DETAIL_PATH}/${slug}`
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Plexaris-Scraper/1.0 (supplier-outreach)' },
  })

  if (!resp.ok) {
    logger.warn(`Detail page returned ${resp.status} for ${slug}`)
    return {
      website: null,
      address: null,
      longDescription: null,
      email: null,
      phone: null,
    }
  }

  const html = await resp.text()

  // Extract __NEXT_DATA__ JSON which contains the company data server-rendered
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s,
  )
  if (!match) {
    logger.warn(`No __NEXT_DATA__ found for ${slug}`)
    return {
      website: null,
      address: null,
      longDescription: null,
      email: null,
      phone: null,
    }
  }

  try {
    const data = JSON.parse(match[1]) as {
      props?: {
        pageProps?: {
          componentProps?: Record<
            string,
            {
              company?: {
                website?: string
                address?: string
                longDescription?: string
                email?: string
                phone?: string
              }
            }
          >
        }
      }
    }
    const componentProps = data?.props?.pageProps?.componentProps ?? {}

    for (const val of Object.values(componentProps)) {
      if (val?.company) {
        return {
          website: val.company.website || null,
          address: val.company.address || null,
          longDescription: val.company.longDescription || null,
          email: val.company.email || null,
          phone: val.company.phone || null,
        }
      }
    }
  } catch {
    logger.warn(`Failed to parse __NEXT_DATA__ for ${slug}`)
  }

  return {
    website: null,
    address: null,
    longDescription: null,
    email: null,
    phone: null,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const scrapeHorecavaTask = task({
  id: 'scrape-horecava',
  run: async (payload?: {
    seed?: boolean
  }): Promise<{ exhibitors: Exhibitor[]; total: number }> => {
    const seed = payload?.seed ?? true

    logger.log('Starting Horecava exhibitor scrape', { seed })

    // Step 1: Fetch the full exhibitor list from the API
    const listItems = await fetchExhibitorList()
    logger.log(`Found ${listItems.length} exhibitors in list`)

    // Step 2: Fetch detail pages in batches to get website, address, description
    const exhibitors: Exhibitor[] = []

    for (let i = 0; i < listItems.length; i += BATCH_SIZE) {
      const batch = listItems.slice(i, i + BATCH_SIZE)

      const details = await Promise.all(
        batch.map((item) => fetchExhibitorDetail(item.slug)),
      )

      const batchExhibitors: Exhibitor[] = []
      for (let j = 0; j < batch.length; j++) {
        const item = batch[j]
        const detail = details[j]

        batchExhibitors.push({
          id: item.id,
          slug: item.slug,
          name: item.name,
          description: item.description ?? detail.longDescription,
          longDescription: detail.longDescription,
          website: detail.website,
          email: detail.email,
          phone: detail.phone,
          address: detail.address,
          countryCode: item.countryCode ?? null,
          logo: item.logo ?? null,
          stands: item.stands ?? [],
        })
      }

      exhibitors.push(...batchExhibitors)

      if (seed) {
        const result = await seedSuppliersTask
          .triggerAndWait({ exhibitors: batchExhibitors })
          .unwrap()
        logger.log('Seeded batch', {
          created: result.created,
          skipped: result.skipped,
          failed: result.failed,
        })
      }

      logger.log(
        `Processed ${Math.min(i + BATCH_SIZE, listItems.length)}/${listItems.length} exhibitors`,
      )

      // Rate-limit between batches
      if (i + BATCH_SIZE < listItems.length) {
        await sleep(DELAY_MS)
      }
    }

    logger.log('Scrape complete', { total: exhibitors.length })

    return { exhibitors, total: exhibitors.length }
  },
})
