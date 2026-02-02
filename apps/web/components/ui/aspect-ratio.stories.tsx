import type { Meta, StoryObj } from "@storybook/react"
import { AspectRatio } from "./aspect-ratio"

const meta: Meta<typeof AspectRatio> = {
  title: "ui/AspectRatio",
  component: AspectRatio,
}
export default meta
type Story = StoryObj<typeof AspectRatio>

export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          16:9
        </div>
      </AspectRatio>
    </div>
  ),
}
