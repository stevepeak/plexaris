import { type Meta, type StoryObj } from '@storybook/react'

import { SecurityTab } from './security-tab'

const meta: Meta<typeof SecurityTab> = {
  title: 'Profile / SecurityTab',
  component: SecurityTab,
}
export default meta
type Story = StoryObj<typeof SecurityTab>

const noop = () => Promise.resolve({})
// eslint-disable-next-line @typescript-eslint/no-empty-function
const voidNoop = () => {}

export const Default: Story = {
  args: {
    onChangePassword: noop,
    passkeys: [],
    passkeysLoading: false,
    onAddPasskey: voidNoop,
    onDeletePasskey: voidNoop,
  },
}

export const WithPasskeys: Story = {
  args: {
    onChangePassword: noop,
    passkeys: [
      {
        id: '1',
        name: 'Mac',
        aaguid: 'bada5566-a7aa-401f-bd96-45619a55120d',
        createdAt: '2026-01-15T10:30:00Z',
      },
      {
        id: '2',
        name: 'iPhone',
        aaguid: 'fbfc3007-154e-4ecc-8c0b-6e020557d7bd',
        createdAt: '2026-02-01T14:00:00Z',
      },
    ],
    passkeysLoading: false,
    onAddPasskey: voidNoop,
    onDeletePasskey: voidNoop,
  },
}

export const PasskeysLoading: Story = {
  args: {
    onChangePassword: noop,
    passkeysLoading: true,
    onAddPasskey: voidNoop,
    onDeletePasskey: voidNoop,
  },
}
