import type { Meta, StoryObj } from "@storybook/react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./carousel"
import { Card, CardContent } from "./card"

const meta: Meta<typeof Carousel> = {
  title: "ui/Carousel",
  component: Carousel,
}
export default meta
type Story = StoryObj<typeof Carousel>

export const Default: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs mx-auto">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, i) => (
          <CarouselItem key={i}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="text-4xl font-semibold">{i + 1}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}
