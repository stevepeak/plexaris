import { Button, Heading, Text } from '@react-email/components'

import { Layout } from '../src/components/layout'

export type UserInviteEmailProps = {
  invitedByName: string
  organizationName: string
  inviteLink: string
  role: 'owner' | 'member'
}

export default function UserInviteEmail({
  invitedByName,
  organizationName,
  inviteLink,
  role,
}: UserInviteEmailProps) {
  return (
    <Layout
      preview={`${invitedByName} invited you to join ${organizationName}`}
    >
      <Heading style={heading}>You&apos;ve been invited</Heading>
      <Text style={text}>
        <strong>{invitedByName}</strong> has invited you to join{' '}
        <strong>{organizationName}</strong> as a
        {role === 'owner' ? 'n owner' : ' member'}.
      </Text>
      <Text style={text}>
        Click the button below to accept the invitation and get started.
      </Text>
      <Button style={button} href={inviteLink}>
        Accept Invitation
      </Button>
      <Text style={muted}>
        If you weren&apos;t expecting this invitation, you can safely ignore
        this email.
      </Text>
    </Layout>
  )
}

const PreviewProps: UserInviteEmailProps = {
  invitedByName: 'Steve',
  organizationName: 'Acme Corp',
  inviteLink: 'https://app.plexaris.com/invite/abc123',
  role: 'member',
}

UserInviteEmail.PreviewProps = PreviewProps

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
