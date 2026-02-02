import  { type Meta, type StoryObj } from "@storybook/react"

import { Checkbox } from "./checkbox"
import { Label } from "./label"

const meta: Meta<typeof Checkbox> = {
  title: "ui/Checkbox",
  component: Checkbox,
}
export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}
