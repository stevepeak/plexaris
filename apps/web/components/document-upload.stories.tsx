import { type Meta, type StoryObj } from '@storybook/react'

import { DocumentUpload } from './document-upload'

const meta: Meta<typeof DocumentUpload> = {
  title: 'Components / DocumentUpload',
  component: DocumentUpload,
}
export default meta
type Story = StoryObj<typeof DocumentUpload>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const Empty: Story = {
  render: () => <DocumentUpload files={[]} onFilesChange={noop} error={null} />,
}

export const WithFiles: Story = {
  render: () => (
    <DocumentUpload
      files={[
        new File(['test content'], 'products.csv', { type: 'text/csv' }),
        new File(['pdf content'], 'catalog.pdf', {
          type: 'application/pdf',
        }),
      ]}
      onFilesChange={noop}
      error={null}
    />
  ),
}

export const Uploading: Story = {
  render: () => (
    <DocumentUpload
      files={[new File(['test content'], 'products.csv', { type: 'text/csv' })]}
      onFilesChange={noop}
      isUploading
      error={null}
    />
  ),
}

export const WithError: Story = {
  render: () => (
    <DocumentUpload
      files={[]}
      onFilesChange={noop}
      error="Failed to upload files"
    />
  ),
}
