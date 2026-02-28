import { Button, Heading, Text } from '@react-email/components'

import { Layout } from '../src/components/layout'
import { type Locale, t } from '../src/i18n'

export type WelcomeEmailProps = {
  userName: string
  loginLink: string
  locale?: Locale
}

export default function WelcomeEmail({
  userName,
  loginLink,
  locale = 'en',
}: WelcomeEmailProps) {
  return (
    <Layout
      preview={t('welcome.preview', locale, { userName })}
      locale={locale}
    >
      <Heading style={heading}>{t('welcome.heading', locale)}</Heading>
      <Text style={text}>{t('welcome.greeting', locale, { userName })}</Text>
      <Text style={text}>{t('welcome.body', locale)}</Text>
      <Button style={button} href={loginLink}>
        {t('welcome.button', locale)}
      </Button>
      <Text style={muted}>{t('welcome.help', locale)}</Text>
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
