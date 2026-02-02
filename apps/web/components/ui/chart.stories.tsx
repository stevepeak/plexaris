import  { type Meta, type StoryObj } from "@storybook/react"
import { Bar, BarChart, XAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart"

const meta: Meta = {
  title: "ui/Chart",
}
export default meta
type Story = StoryObj

const data = [
  { month: "Jan", value: 186 },
  { month: "Feb", value: 305 },
  { month: "Mar", value: 237 },
  { month: "Apr", value: 73 },
  { month: "May", value: 209 },
  { month: "Jun", value: 214 },
]

const chartConfig = {
  value: { label: "Value", color: "var(--primary)" },
}

export const Default: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-w-sm">
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--primary)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
}
