import  { type Meta, type StoryObj } from "@storybook/react"

import { Button } from "./button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"

const meta: Meta<typeof Collapsible> = {
  title: "UI / Layout / Collapsible",
  component: Collapsible,
}
export default meta
type Story = StoryObj<typeof Collapsible>

export const Default: Story = {
  render: () => (
    <Collapsible className="w-[350px] space-y-2">
      <div className="flex items-center justify-between space-x-4">
        <h4 className="text-sm font-semibold">Collapsible Section</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">Toggle</Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 text-sm">Always visible</div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 text-sm">Hidden item 1</div>
        <div className="rounded-md border px-4 py-2 text-sm">Hidden item 2</div>
      </CollapsibleContent>
    </Collapsible>
  ),
}
