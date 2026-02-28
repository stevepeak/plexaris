import { Button, Heading, Text } from '@react-email/components'

import { Layout } from '../src/components/layout'
import { type Locale, t } from '../src/i18n'

export type PasswordResetEmailProps = {
  userName: string
  resetLink: string
  locale?: Locale
}

export default function PasswordResetEmail({
  userName,
  resetLink,
  locale = 'en',
}: PasswordResetEmailProps) {
  return (
    <Layout preview={t('passwordReset.preview', locale)} locale={locale}>
      <Heading style={heading}>{t('passwordReset.heading', locale)}</Heading>
      <Text style={text}>
        {t('passwordReset.greeting', locale, { userName })}
      </Text>
      <Text style={text}>{t('passwordReset.body', locale)}</Text>
      <Button style={button} href={resetLink}>
        {t('passwordReset.button', locale)}
      </Button>
      <Text style={muted}>{t('passwordReset.disclaimer', locale)}</Text>
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
