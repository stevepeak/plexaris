import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "./input"
import { Label } from "./label"

const meta: Meta<typeof Input> = {
  title: "ui/Input",
  component: Input,
}
export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = { args: { type: "text", placeholder: "Enter text..." } }
export const Email: Story = { args: { type: "email", placeholder: "Email address" } }
export const Password: Story = { args: { type: "password", placeholder: "Password" } }
export const Disabled: Story = { args: { placeholder: "Disabled", disabled: true } }
export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
}
