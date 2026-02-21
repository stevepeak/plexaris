import { type Meta, type StoryObj } from '@storybook/react'

import { DangerZoneTab } from './danger-zone-tab'

const meta: Meta<typeof DangerZoneTab> = {
  title: 'Organization / Tabs / DangerZoneTab',
  component: DangerZoneTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof DangerZoneTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
