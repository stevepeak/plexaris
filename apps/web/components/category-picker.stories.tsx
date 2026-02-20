import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'

import { CategoryPicker } from './category-picker'

const meta: Meta<typeof CategoryPicker> = {
  title: 'Product / CategoryPicker',
  component: CategoryPicker,
  decorators: [
    (story) => <div className="mx-auto max-w-sm p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof CategoryPicker>

function Controlled({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <div className="grid gap-2">
      <CategoryPicker value={value} onValueChange={setValue} />
      <p className="text-xs text-muted-foreground">
        Value: {value || '(empty)'}
      </p>
    </div>
  )
}

export const Empty: Story = {
  render: () => <Controlled />,
}

export const PrimarySelected: Story = {
  render: () => <Controlled initial="Fish" />,
}

export const SubCategorySelected: Story = {
  render: () => <Controlled initial="Fish > Fresh fish" />,
}
