import  { type Meta, type StoryObj } from "@storybook/react"

import { Label } from "./label"
import { Textarea } from "./textarea"

const meta: Meta<typeof Textarea> = {
  title: "UI / Forms / Textarea",
  component: Textarea,
}
export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = { args: { placeholder: "Type your message here." } }
export const Disabled: Story = { args: { placeholder: "Disabled", disabled: true } }
export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea placeholder="Type your message here." id="message" />
    </div>
  ),
}
