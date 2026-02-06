import { type Meta, type StoryObj } from '@storybook/react'

import { SettingsTab } from './settings-tab'

const meta: Meta<typeof SettingsTab> = {
  title: 'Organization / Tabs / SettingsTab',
  component: SettingsTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof SettingsTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
