import  { type Meta, type StoryObj } from "@storybook/react"
import * as React from "react"

import { Calendar } from "./calendar"

const meta: Meta<typeof Calendar> = {
  title: "UI / Forms / Calendar",
  component: Calendar,
}
export default meta
type Story = StoryObj<typeof Calendar>

function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
}

export const Default: Story = {
  render: () => <CalendarDemo />,
}
