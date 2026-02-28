import { Button, Heading, Text } from '@react-email/components'

import { Layout } from '../src/components/layout'
import { type Locale, t } from '../src/i18n'

export type UserInviteEmailProps = {
  invitedByName: string
  organizationName: string
  inviteLink: string
  roleName: string
  locale?: Locale
}

export default function UserInviteEmail({
  invitedByName,
  organizationName,
  inviteLink,
  roleName,
  locale = 'en',
}: UserInviteEmailProps) {
  const vars = { invitedByName, organizationName, roleName }
  return (
    <Layout preview={t('invite.preview', locale, vars)} locale={locale}>
      <Heading style={heading}>{t('invite.heading', locale)}</Heading>
      <Text style={text}>{t('invite.body', locale, vars)}</Text>
      <Text style={text}>{t('invite.cta', locale)}</Text>
      <Button style={button} href={inviteLink}>
        {t('invite.button', locale)}
      </Button>
      <Text style={muted}>{t('invite.disclaimer', locale)}</Text>
    </Layout>
  )
}

const PreviewProps: UserInviteEmailProps = {
  invitedByName: 'Steve',
  organizationName: 'Acme Corp',
  inviteLink: 'https://app.plexaris.com/invite/abc123',
  roleName: 'Member',
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
