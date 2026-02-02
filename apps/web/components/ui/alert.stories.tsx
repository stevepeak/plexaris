import  { type Meta, type StoryObj } from "@storybook/react"

import { Alert, AlertDescription, AlertTitle } from "./alert"

const meta: Meta<typeof Alert> = {
  title: "ui/Alert",
  component: Alert,
}
export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
    </Alert>
  ),
}
