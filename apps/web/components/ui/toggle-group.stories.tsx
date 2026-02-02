import  { type Meta, type StoryObj } from "@storybook/react"

import { ToggleGroup, ToggleGroupItem } from "./toggle-group"

const meta: Meta<typeof ToggleGroup> = {
  title: "ui/ToggleGroup",
  component: ToggleGroup,
}
export default meta
type Story = StoryObj<typeof ToggleGroup>

export const Default: Story = {
  render: () => (
    <ToggleGroup type="multiple">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">B</ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">I</ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">U</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Single: Story = {
  render: () => (
    <ToggleGroup type="single">
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
      <ToggleGroupItem value="c">C</ToggleGroupItem>
    </ToggleGroup>
  ),
}
