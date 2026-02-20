import  { type Meta, type StoryObj } from "@storybook/react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable"

const meta: Meta<typeof ResizablePanelGroup> = {
  title: "UI / Layout / Resizable",
  component: ResizablePanelGroup,
}
export default meta
type Story = StoryObj<typeof ResizablePanelGroup>

export const Default: Story = {
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className="max-w-md rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6"><span className="font-semibold">Panel One</span></div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6"><span className="font-semibold">Panel Two</span></div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}
