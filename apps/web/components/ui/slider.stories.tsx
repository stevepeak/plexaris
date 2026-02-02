import  { type Meta, type StoryObj } from "@storybook/react"

import { Slider } from "./slider"

const meta: Meta<typeof Slider> = {
  title: "ui/Slider",
  component: Slider,
}
export default meta
type Story = StoryObj<typeof Slider>

export const Default: Story = {
  render: () => <Slider defaultValue={[50]} max={100} step={1} className="w-[300px]" />,
}
