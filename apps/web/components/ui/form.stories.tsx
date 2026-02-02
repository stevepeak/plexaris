import { zodResolver } from "@hookform/resolvers/zod"
import  { type Meta, type StoryObj } from "@storybook/react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "./button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"
import { Input } from "./input"

const meta: Meta = {
  title: "ui/Form",
}
export default meta
type Story = StoryObj

const formSchema = z.object({ username: z.string().min(2, "Username must be at least 2 characters.") })

function FormDemo() {
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { username: "" } })
  function onSubmit(_values: z.infer<typeof formSchema>) {
    // handle submit
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-[350px]">
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl><Input placeholder="shadcn" {...field} /></FormControl>
            <FormDescription>This is your public display name.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

export const Default: Story = {
  render: () => <FormDemo />,
}
