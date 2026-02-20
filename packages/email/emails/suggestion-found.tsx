import { Button, Heading, Section, Text } from '@react-email/components'

import { Layout } from '../src/components/layout'

export type SuggestionFoundEmailProps = {
  userName: string
  organizationName: string
  suggestionLabel: string
  suggestionAction: 'create' | 'update' | 'update_field'
  targetType: 'product' | 'organization'
  confidence: string | null
  source: string | null
  reviewLink: string
}

const actionLabels: Record<
  SuggestionFoundEmailProps['suggestionAction'],
  string
> = {
  create: 'Create',
  update: 'Update',
  update_field: 'Update field',
}

export default function SuggestionFoundEmail({
  userName,
  organizationName,
  suggestionLabel,
  suggestionAction,
  targetType,
  confidence,
  source,
  reviewLink,
}: SuggestionFoundEmailProps) {
  return (
    <Layout
      preview={`New suggestion for ${organizationName}: ${suggestionLabel}`}
    >
      <Heading style={heading}>New Suggestion Found</Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        A new suggestion has been found for <strong>{organizationName}</strong>.
      </Text>
      <Section style={card}>
        <Text style={cardTitle}>{suggestionLabel}</Text>
        <Text style={cardDetail}>
          <strong>Action:</strong> {actionLabels[suggestionAction]}
        </Text>
        <Text style={cardDetail}>
          <strong>Target:</strong> {targetType}
        </Text>
        {confidence && (
          <Text style={cardDetail}>
            <strong>Confidence:</strong> {confidence}
          </Text>
        )}
        {source && (
          <Text style={cardDetail}>
            <strong>Source:</strong> {source}
          </Text>
        )}
      </Section>
      <Button style={button} href={reviewLink}>
        Review Suggestion
      </Button>
      <Text style={muted}>
        You&apos;re receiving this because you have email notifications enabled
        for suggestions.
      </Text>
    </Layout>
  )
}

const PreviewProps: SuggestionFoundEmailProps = {
  userName: 'Jane',
  organizationName: 'Acme Corp',
  suggestionLabel: 'Add product description for Widget Pro',
  suggestionAction: 'update_field',
  targetType: 'product',
  confidence: '92%',
  source: 'Product Feed',
  reviewLink: 'https://app.plexaris.com/org/acme/suggestions/123',
}

SuggestionFoundEmail.PreviewProps = PreviewProps

const heading = {
  fontSize: '24px',
  fontWeight: '600' as const,
  color: '#1a1a1a',
  margin: '0 0 16px',
}

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
}

const card = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '16px 0',
}

const cardTitle = {
  fontSize: '16px',
  fontWeight: '600' as const,
  color: '#1a1a1a',
  margin: '0 0 8px',
}

const cardDetail = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#484848',
  margin: '0 0 4px',
}

const button = {
  backgroundColor: '#1a1a1a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px 0',
}

const muted = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#8898aa',
}
