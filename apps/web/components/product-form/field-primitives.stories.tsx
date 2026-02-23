import { type Meta, type StoryObj } from '@storybook/react'

import { FieldInput, FieldLabel, FieldNumber } from './field-primitives'

const meta: Meta = {
  title: 'Product / ProductForm / FieldPrimitives',
  decorators: [
    (story) => <div className="mx-auto max-w-md p-4">{story()}</div>,
  ],
}
export default meta

export const LabelDefault: StoryObj = {
  render: () => <FieldLabel htmlFor="demo">Field label</FieldLabel>,
}

export const LabelWithUndo: StoryObj = {
  render: () => (
    <FieldLabel
      htmlFor="demo"
      change={{ originalValue: 'Old value', onUndo: () => undefined }}
    >
      Changed field
    </FieldLabel>
  ),
}

export const TextInput: StoryObj = {
  render: () => (
    <FieldInput
      label="Brand"
      value="BioFresh"
      onChange={() => undefined}
      placeholder="Enter brand name"
    />
  ),
}

export const TextInputWithChange: StoryObj = {
  render: () => (
    <FieldInput
      label="Brand"
      value="BioFresh Updated"
      onChange={() => undefined}
      change={{
        originalValue: 'BioFresh',
        onUndo: () => undefined,
        fieldId: 'field-brand',
      }}
    />
  ),
}

export const NumberInput: StoryObj = {
  render: () => (
    <FieldNumber label="Weight (g)" value="500" onChange={() => undefined} />
  ),
}

export const NumberInputEmpty: StoryObj = {
  render: () => (
    <FieldNumber label="Weight (g)" value="" onChange={() => undefined} />
  ),
}
