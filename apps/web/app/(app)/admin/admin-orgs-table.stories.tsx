import { type Meta, type StoryObj } from '@storybook/react'

import { type AdminOrg, AdminOrgsTable } from './admin-orgs-table'

const meta: Meta<typeof AdminOrgsTable> = {
  title: 'Admin / OrgsTable',
  component: AdminOrgsTable,
  decorators: [
    (story) => <div className="mx-auto max-w-5xl p-8">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof AdminOrgsTable>

const sampleOrgs: AdminOrg[] = [
  {
    id: '1',
    name: 'Bakkerij de Gouden Korst',
    type: 'supplier',
    logoUrl: null,
    claimed: true,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastInteraction: new Date(Date.now() - 3600000).toISOString(),
    orderCount: 42,
    suggestionCount: 8,
    productCount: 156,
    memberCount: 3,
  },
  {
    id: '2',
    name: 'Hotel Amsterdam Central',
    type: 'horeca',
    logoUrl: null,
    claimed: true,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    lastInteraction: new Date(Date.now() - 86400000).toISOString(),
    orderCount: 18,
    suggestionCount: 3,
    productCount: 0,
    memberCount: 5,
  },
  {
    id: '3',
    name: 'Fresh Produce B.V.',
    type: 'supplier',
    logoUrl: null,
    claimed: false,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastInteraction: new Date(Date.now() - 7 * 86400000).toISOString(),
    orderCount: 0,
    suggestionCount: 12,
    productCount: 89,
    memberCount: 1,
  },
]

export const Default: Story = {
  args: { orgs: sampleOrgs },
}

export const Empty: Story = {
  args: { orgs: [] },
}

export const SingleOrg: Story = {
  args: { orgs: [sampleOrgs[0]] },
}
