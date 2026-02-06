import { type Meta, type StoryObj } from '@storybook/react'

import { SuggestionsTab } from './suggestions-tab'

const meta: Meta<typeof SuggestionsTab> = {
  title: 'Organization / Tabs / SuggestionsTab',
  component: SuggestionsTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof SuggestionsTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
