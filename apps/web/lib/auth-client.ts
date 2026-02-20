import { passkeyClient } from '@better-auth/passkey/client'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  plugins: [
    passkeyClient(),
    inferAdditionalFields({
      user: {
        phone: { type: 'string', required: false },
        contactPreference: { type: 'string', required: false },
      },
    }),
  ],
})
