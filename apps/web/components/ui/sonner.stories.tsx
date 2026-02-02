import  { type Meta, type StoryObj } from "@storybook/react"
import { toast } from "sonner"

import { Button } from "./button"
import { Toaster } from "./sonner"

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
