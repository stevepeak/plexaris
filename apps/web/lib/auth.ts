import { createDb, schema } from '@app/db'
import { PasswordResetEmail } from '@app/email'
import { sendEmail } from '@app/resend'
import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createElement } from 'react'

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
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        user.email,
        'Reset your password',
        createElement(PasswordResetEmail, {
          userName: user.name,
          resetLink: url,
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
