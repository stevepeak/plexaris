import  { type Meta, type StoryObj } from "@storybook/react"

import { Badge } from "./badge"

const meta: Meta<typeof Badge> = {
  title: "ui/Badge",
  component: Badge,
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = { render: () => <Badge>Badge</Badge> }
export const Secondary: Story = { render: () => <Badge variant="secondary">Secondary</Badge> }
export const Destructive: Story = { render: () => <Badge variant="destructive">Destructive</Badge> }
export const Outline: Story = { render: () => <Badge variant="outline">Outline</Badge> }
