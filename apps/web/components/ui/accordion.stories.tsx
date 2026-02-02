import type { Meta, StoryObj } from "@storybook/react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"

const meta: Meta<typeof Accordion> = {
  title: "ui/Accordion",
  component: Accordion,
}
export default meta
type Story = StoryObj<typeof Accordion>

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-sm">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>Yes. It comes with default styles from shadcn/ui.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes. It animates open and closed by default.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
