import  { type Meta, type StoryObj } from "@storybook/react"

import { Toggle } from "./toggle"

const meta: Meta<typeof Toggle> = {
  title: "UI / Forms / Toggle",
  component: Toggle,
}
export default meta
type Story = StoryObj<typeof Toggle>

export const Default: Story = { args: { children: "Toggle" } }
export const Outline: Story = { args: { children: "Outline", variant: "outline" } }
export const Small: Story = { args: { children: "S", size: "sm" } }
export const Large: Story = { args: { children: "Large", size: "lg" } }
