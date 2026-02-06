import { type Meta, type StoryObj } from '@storybook/react'

import { type ScrapeIssue, ScrapeIssuesTable } from './scrape-issues-table'

const meta: Meta<typeof ScrapeIssuesTable> = {
  title: 'Components / ScrapeIssuesTable',
  component: ScrapeIssuesTable,
}
export default meta
type Story = StoryObj<typeof ScrapeIssuesTable>

const sampleIssues: ScrapeIssue[] = [
  {
    source: 'https://example.com/products',
    field: 'unit.gtin',
    rawValue: 'ABC-NOT-A-NUMBER',
    error: 'Expected a valid EAN/GTIN code',
    timestamp: '2026-02-06T12:00:00Z',
  },
  {
    source: 'catalog.pdf',
    field: 'price.amount',
    rawValue: 'free',
    error: 'Expected a numeric value',
    timestamp: '2026-02-06T12:01:00Z',
  },
  {
    source: 'https://example.com/about',
    field: 'vatNumber',
    rawValue: null,
    error: 'VAT number is required for suppliers',
    timestamp: '2026-02-06T12:02:00Z',
  },
]

export const WithIssues: Story = {
  render: () => <ScrapeIssuesTable issues={sampleIssues} />,
}

export const SingleIssue: Story = {
  render: () => <ScrapeIssuesTable issues={[sampleIssues[0]!]} />,
}

export const Empty: Story = {
  render: () => <ScrapeIssuesTable issues={[]} />,
}
