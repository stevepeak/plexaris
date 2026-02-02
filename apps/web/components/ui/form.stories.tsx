import type { Meta, StoryObj } from "@storybook/react"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Form } from "./form"
import { Input } from "./input"
import { Button } from "./button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const meta: Meta = {
  title: "ui/Form",
}
export default meta
type Story = StoryObj

const formSchema = z.object({ username: z.string().min(2, "Username must be at least 2 characters.") })

export const Default: Story = {
  render: () => {
    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { username: "" } })
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => {})} className="space-y-8 w-[350px]">
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
  },
}
