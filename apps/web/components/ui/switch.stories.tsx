import { type Meta, type StoryObj } from "@storybook/react"

import { Label } from "./label"
import { Switch } from "./switch"

const meta: Meta<typeof Switch> = {
  title: "UI / Forms / Switch",
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

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="visibility" icons />
      <Label htmlFor="visibility">Visibility</Label>
    </div>
  ),
}

export const WithIconsChecked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="visibility-on" icons defaultChecked />
      <Label htmlFor="visibility-on">Visible</Label>
    </div>
  ),
}
