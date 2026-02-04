import  { type Meta, type StoryObj } from "@storybook/react"

import { Button } from "./button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card"

const meta: Meta<typeof HoverCard> = {
  title: "UI / Overlay / HoverCard",
  component: HoverCard,
}
export default meta
type Story = StoryObj<typeof HoverCard>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">Hover me</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">shadcn/ui</h4>
          <p className="text-sm">Beautifully designed components built with Radix UI and Tailwind CSS.</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}
