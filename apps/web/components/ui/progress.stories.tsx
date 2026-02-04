import  { type Meta, type StoryObj } from "@storybook/react"

import { Progress } from "./progress"

const meta: Meta<typeof Progress> = {
  title: "UI / Feedback / Progress",
  component: Progress,
}
export default meta
type Story = StoryObj<typeof Progress>

export const Default: Story = { render: () => <Progress value={60} className="w-[300px]" /> }
export const Empty: Story = { render: () => <Progress value={0} className="w-[300px]" /> }
export const Full: Story = { render: () => <Progress value={100} className="w-[300px]" /> }
