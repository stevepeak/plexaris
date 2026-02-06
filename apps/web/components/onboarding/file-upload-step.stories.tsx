import { type Meta, type StoryObj } from '@storybook/react'

import { FileUploadStep } from './file-upload-step'

const meta: Meta<typeof FileUploadStep> = {
  title: 'Onboarding / FileUploadStep',
  component: FileUploadStep,
}
export default meta
type Story = StoryObj<typeof FileUploadStep>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const Empty: Story = {
  render: () => (
    <FileUploadStep
      files={[]}
      onFilesChange={noop}
      onBack={noop}
      onSubmit={noop}
      isLoading={false}
      error={null}
    />
  ),
}

export const WithFiles: Story = {
  render: () => (
    <FileUploadStep
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
    <FileUploadStep
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
    <FileUploadStep
      files={[]}
      onFilesChange={noop}
      onBack={noop}
      onSubmit={noop}
      isLoading={false}
      error="Failed to upload files"
    />
  ),
}
