import { createDb, schema } from '@app/db'
import { type Locale, PasswordResetEmail, WelcomeEmail } from '@app/email'
import { sendEmail } from '@app/resend'
import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { cookies } from 'next/headers'
import { createElement } from 'react'

async function getLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies()
    const value = cookieStore.get('locale')?.value
    return value === 'nl' ? 'nl' : 'en'
  } catch {
    return 'en'
  }
}

const db = createDb()

// eslint-disable-next-line no-process-env
const baseURL = process.env.BETTER_AUTH_BASE_URL ?? 'http://localhost:3000'
const origin = new URL(baseURL)

export const auth = betterAuth({
  baseURL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  user: {
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
      },
      contactPreference: {
        type: 'string',
        required: false,
        fieldName: 'contact_preference',
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const locale = await getLocale()
            await sendEmail(
              user.email,
              'Welcome to Plexaris',
              createElement(WelcomeEmail, {
                userName: user.name,
                loginLink: `${baseURL}/login`,
                locale,
              }),
            )
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[auth] Failed to send welcome email:', error)
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const locale = await getLocale()
      await sendEmail(
        user.email,
        'Reset your password',
        createElement(PasswordResetEmail, {
          userName: user.name,
          resetLink: url,
          locale,
        }),
      )
    },
  },
  plugins: [
    passkey({
      rpID: origin.hostname,
      rpName: 'Plexaris',
      origin: origin.origin,
    }),
  ],
})
