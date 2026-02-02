import type { Meta, StoryObj } from "@storybook/react"
import { Toaster } from "./sonner"
import { Button } from "./button"
import { toast } from "sonner"

const meta: Meta<typeof Toaster> = {
  title: "ui/Sonner",
  component: Toaster,
}
export default meta
type Story = StoryObj<typeof Toaster>

export const Default: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast("Event has been created", { description: "Monday, January 1st at 6:00 PM" })}>
        Show Toast
      </Button>
    </div>
  ),
}
