import type { Meta, StoryObj } from "@storybook/react"
import { Switch } from "./switch"
import { Label } from "./label"

const meta: Meta<typeof Switch> = {
  title: "ui/Switch",
  component: Switch,
}
export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
}
