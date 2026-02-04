import  { type Meta, type StoryObj } from "@storybook/react"

import { Button } from "./button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./sheet"

const meta: Meta<typeof Sheet> = {
  title: "UI / Overlay / Sheet",
  component: Sheet,
}
export default meta
type Story = StoryObj<typeof Sheet>

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>This is a sheet description.</SheetDescription>
        </SheetHeader>
        <div className="py-4">Sheet content goes here.</div>
      </SheetContent>
    </Sheet>
  ),
}
