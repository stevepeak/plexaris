import  { type Meta, type StoryObj } from "@storybook/react"

import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

const meta: Meta<typeof Avatar> = {
  title: "ui/Avatar",
  component: Avatar,
}
export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
}
