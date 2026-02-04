import { type Meta, type StoryObj } from '@storybook/react'

import { OrgSwitcher } from './org-switcher'

const meta: Meta<typeof OrgSwitcher> = {
  title: 'Organization / Switcher / OrgSwitcher',
  component: OrgSwitcher,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof OrgSwitcher>

const sampleOrgs = [
  {
    id: '1',
    name: 'Fresh Foods BV',
    type: 'supplier' as const,
    claimed: true,
    role: 'owner' as const,
  },
  {
    id: '2',
    name: 'Restaurant De Gouden Leeuw',
    type: 'horeca' as const,
    claimed: true,
    role: 'member' as const,
  },
  {
    id: '3',
    name: 'Bakkerij Jansen',
    type: 'supplier' as const,
    claimed: true,
    role: 'owner' as const,
  },
]

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const Default: Story = {
  render: () => (
    <OrgSwitcher
      organizations={sampleOrgs}
      activeOrg={sampleOrgs[0]!}
      onSwitch={noop}
      isPending={false}
    />
  ),
}

export const SingleOrg: Story = {
  render: () => (
    <OrgSwitcher
      organizations={[sampleOrgs[0]!]}
      activeOrg={sampleOrgs[0]!}
      onSwitch={noop}
      isPending={false}
    />
  ),
}

export const Loading: Story = {
  render: () => (
    <OrgSwitcher
      organizations={[]}
      activeOrg={null}
      onSwitch={noop}
      isPending={true}
    />
  ),
}
