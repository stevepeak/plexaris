import  { type Meta, type StoryObj } from "@storybook/react"

import { ScrollArea } from "./scroll-area"
import { Separator } from "./separator"

const meta: Meta<typeof ScrollArea> = {
  title: "ui/ScrollArea",
  component: ScrollArea,
}
export default meta
type Story = StoryObj<typeof ScrollArea>

const tags = Array.from({ length: 50 }).map((_, i) => `Item ${i + 1}`)

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Items</h4>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
