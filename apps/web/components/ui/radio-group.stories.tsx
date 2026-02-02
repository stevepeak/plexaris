import type { Meta, StoryObj } from "@storybook/react"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { Label } from "./label"

const meta: Meta<typeof RadioGroup> = {
  title: "ui/RadioGroup",
  component: RadioGroup,
}
export default meta
type Story = StoryObj<typeof RadioGroup>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="r1" />
        <Label htmlFor="r1">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="r2" />
        <Label htmlFor="r2">Option Two</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="r3" />
        <Label htmlFor="r3">Option Three</Label>
      </div>
    </RadioGroup>
  ),
}
