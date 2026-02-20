import { Button, Heading, Text } from '@react-email/components'

import { Layout } from '../src/components/layout'

export type PasswordResetEmailProps = {
  userName: string
  resetLink: string
}

export default function PasswordResetEmail({
  userName,
  resetLink,
}: PasswordResetEmailProps) {
  return (
    <Layout preview={`Reset your Plexaris password`}>
      <Heading style={heading}>Reset your password</Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        We received a request to reset your Plexaris password. Click the button
        below to choose a new password.
      </Text>
      <Button style={button} href={resetLink}>
        Reset Password
      </Button>
      <Text style={muted}>
        If you didn&apos;t request a password reset, you can safely ignore this
        email. The link will expire in 1 hour.
      </Text>
    </Layout>
  )
}

const PreviewProps: PasswordResetEmailProps = {
  userName: 'Jane',
  resetLink: 'https://app.plexaris.com/reset-password?token=abc123',
}

PasswordResetEmail.PreviewProps = PreviewProps

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
