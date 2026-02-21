import { type Meta, type StoryObj } from '@storybook/react'

import { AlignTab } from './align-tab'

const meta: Meta<typeof AlignTab> = {
  title: 'Organization / Tabs / AlignTab',
  component: AlignTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof AlignTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
