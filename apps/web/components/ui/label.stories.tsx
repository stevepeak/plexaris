import  { type Meta, type StoryObj } from "@storybook/react"

import { Label } from "./label"

const meta: Meta<typeof Label> = {
  title: "UI / Forms / Label",
  component: Label,
}
export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = { args: { children: "Label text" } }
