import { type Meta, type StoryObj } from '@storybook/react'

import { SourcesStep } from './sources-step'

const meta: Meta<typeof SourcesStep> = {
  title: 'Onboarding / SourcesStep',
  component: SourcesStep,
}
export default meta
type Story = StoryObj<typeof SourcesStep>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const SupplierEmpty: Story = {
  render: () => (
    <SourcesStep
      orgType="supplier"
      urls=""
      onUrlsChange={noop}
      files={[]}
      onFilesChange={noop}
      onBack={noop}
      onSubmit={noop}
      isLoading={false}
      error={null}
    />
  ),
}

export const HorecaEmpty: Story = {
  render: () => (
    <SourcesStep
      orgType="horeca"
      urls=""
      onUrlsChange={noop}
      files={[]}
      onFilesChange={noop}
      onBack={noop}
      onSubmit={noop}
      isLoading={false}
      error={null}
    />
  ),
}

export const Filled: Story = {
  render: () => (
    <SourcesStep
      orgType="supplier"
      urls={'https://example.com\nhttps://example.com/products'}
      onUrlsChange={noop}
      files={[
        new File(['test content'], 'products.csv', { type: 'text/csv' }),
        new File(['pdf content'], 'catalog.pdf', {
          type: 'application/pdf',
        }),
      ]}
      onFilesChange={noop}
      onBack={noop}
      onSubmit={noop}
      isLoading={false}
      error={null}
    />
  ),
}

export const Loading: Story = {
  render: () => (
    <SourcesStep
      orgType="supplier"
      urls="https://example.com"
      onUrlsChange={noop}
      files={[new File(['test content'], 'products.csv', { type: 'text/csv' })]}
      onFilesChange={noop}
      onBack={noop}
      onSubmit={noop}
      isLoading={true}
      error={null}
    />
  ),
}

export const WithError: Story = {
  render: () => (
    <SourcesStep
      orgType="supplier"
      urls=""
      onUrlsChange={noop}
      files={[]}
      onFilesChange={noop}
      onBack={noop}
      onSubmit={noop}
      isLoading={false}
      error="Failed to upload files"
    />
  ),
}
