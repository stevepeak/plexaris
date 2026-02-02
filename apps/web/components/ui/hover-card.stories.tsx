import type { Meta, StoryObj } from "@storybook/react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card"
import { Button } from "./button"

const meta: Meta<typeof HoverCard> = {
  title: "ui/HoverCard",
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
