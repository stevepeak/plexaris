import  { type Meta, type StoryObj } from "@storybook/react"

import { Separator } from "./separator"

const meta: Meta<typeof Separator> = {
  title: "ui/Separator",
  component: Separator,
}
export default meta
type Story = StoryObj<typeof Separator>

export const Horizontal: Story = {
  render: () => (
    <div className="space-y-1 w-[300px]">
      <h4 className="text-sm font-medium">Title</h4>
      <Separator />
      <p className="text-sm text-muted-foreground">Description below separator.</p>
    </div>
  ),
}
