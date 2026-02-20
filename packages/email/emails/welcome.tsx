import { Button, Heading, Text } from '@react-email/components'

import { Layout } from '../src/components/layout'

export type WelcomeEmailProps = {
  userName: string
  loginLink: string
}

export default function WelcomeEmail({
  userName,
  loginLink,
}: WelcomeEmailProps) {
  return (
    <Layout preview={`Welcome to Plexaris, ${userName}!`}>
      <Heading style={heading}>Welcome to Plexaris</Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        Thanks for signing up for Plexaris. We&apos;re excited to have you on
        board. Get started by signing in to your account.
      </Text>
      <Button style={button} href={loginLink}>
        Sign In
      </Button>
      <Text style={muted}>
        If you have any questions, just reply to this email. We&apos;re here to
        help.
      </Text>
    </Layout>
  )
}

const PreviewProps: WelcomeEmailProps = {
  userName: 'Jane',
  loginLink: 'https://app.plexaris.com/sign-in',
}

WelcomeEmail.PreviewProps = PreviewProps

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
