import { type Meta, type StoryObj } from '@storybook/react'

import { OrgSettingsFormFields } from './org-settings-form'

const meta: Meta<typeof OrgSettingsFormFields> = {
  title: 'Organization / Settings / OrgSettingsFormFields',
  component: OrgSettingsFormFields,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof OrgSettingsFormFields>

const noop = async () => ({})

const sampleOrg = {
  id: '1',
  name: 'Fresh Foods BV',
  type: 'supplier' as const,
  description: 'Premium fresh food supplier for restaurants and cafes.',
  logoUrl: 'https://placehold.co/100x100?text=FF',
  phone: '+31 20 123 4567',
  email: 'info@freshfoods.nl',
  address: 'Keizersgracht 123, 1015 CJ Amsterdam',
  deliveryAddress: null,
  deliveryAreas: 'Amsterdam, Haarlem, Amstelveen, Zaandam',
}

const sampleHorecaOrg = {
  id: '2',
  name: 'Restaurant De Gouden Leeuw',
  type: 'horeca' as const,
  description: 'Traditional Dutch restaurant in the heart of Amsterdam.',
  logoUrl: null,
  phone: '+31 20 987 6543',
  email: 'reservations@goudeleeuw.nl',
  address: 'Herengracht 456, 1017 CA Amsterdam',
  deliveryAddress: 'Achterdeur, Herengracht 456',
  deliveryAreas: null,
}

const sampleMembers = [
  {
    id: 'm1',
    userId: 'u1',
    role: 'owner',
    createdAt: new Date().toISOString(),
    userName: 'Demo User',
    userEmail: 'demo@plexaris.com',
  },
  {
    id: 'm2',
    userId: 'u2',
    role: 'member',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    userName: 'Alice Johnson',
    userEmail: 'alice@company.com',
  },
  {
    id: 'm3',
    userId: 'u3',
    role: 'member',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    userName: 'Bob Smith',
    userEmail: 'bob@company.com',
  },
]

export const OwnerView: Story = {
  render: () => (
    <OrgSettingsFormFields
      org={sampleOrg}
      members={sampleMembers}
      isOwner={true}
      isPending={false}
      onUpdateOrg={noop}
      onArchiveOrg={noop}
    />
  ),
}

export const MemberView: Story = {
  render: () => (
    <OrgSettingsFormFields
      org={sampleOrg}
      members={sampleMembers}
      isOwner={false}
      isPending={false}
      onLeaveOrg={noop}
    />
  ),
}

export const HorecaOrg: Story = {
  render: () => (
    <OrgSettingsFormFields
      org={sampleHorecaOrg}
      members={sampleMembers.slice(0, 1)}
      isOwner={true}
      isPending={false}
      onUpdateOrg={noop}
      onArchiveOrg={noop}
    />
  ),
}

export const Loading: Story = {
  render: () => (
    <OrgSettingsFormFields
      org={null}
      members={[]}
      isOwner={false}
      isPending={true}
    />
  ),
}
