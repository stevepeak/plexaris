import { type Meta, type StoryObj } from '@storybook/react'

import { IntegrationsTab } from './integrations-tab'

const meta: Meta<typeof IntegrationsTab> = {
  title: 'Organization / Tabs / IntegrationsTab',
  component: IntegrationsTab,
}
export default meta
type Story = StoryObj<typeof IntegrationsTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
