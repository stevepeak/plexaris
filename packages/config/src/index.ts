import { z } from 'zod'

const envSchema = z.object({
  // Better Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET is required')
    .describe(
      'Secret key for Better Auth encryption/decryption. Generate with: openssl rand -base64 32',
    ),
  BETTER_AUTH_BASE_URL: z.string().url(),

  // Database
  DATABASE_URL: z
    .string()
    .regex(
      /^postgres(ql)?:\/\//,
      'DATABASE_URL must start with postgres:// or postgresql://',
    ),

  // Stripe
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),

  // AI
  OPENROUTER_API_KEY: z.string().startsWith('sk-or-v1-'),

  // Sentry - https://kyoto.sentry.io/insights/projects/plexaris/?project=4510890720231424
  SENTRY_DSN: z.string().startsWith('https://'),
  SENTRY_AUTH_TOKEN: z.string().startsWith('sntrys_').nullable(),

  // UploadThing - https://uploadthing.com/dashboard/plexaris/cogrg6sdb8/api-keys
  UPLOADTHING_TOKEN: z.string(),
  UPLOADTHING_SECRET: z.string(),

  // Resend - https://resend.com/api-keys
  RESEND_API_KEY: z.string().startsWith('re_'),

  // Trigger.dev
  TRIGGER_PROJECT_REF: z.string().min(1).startsWith('proj_'),
  TRIGGER_SECRET_KEY: z.string().min(1).startsWith('tr_'),

  // Cloudinary - https://console.cloudinary.com/app/c-03a0330147e90e3a816e25a4f3fdc2/settings/api-keys
  CLOUDINARY_URL: z.string().startsWith('cloudinary://'),

  // PostHog
  POSTHOG_API_KEY: z.string().nullable(),
  POSTHOG_HOST: z.string().url().default('https://us.i.posthog.com'),
})

export type ParsedEnv = z.infer<typeof envSchema>

export function isDev(): boolean {
  // eslint-disable-next-line no-process-env
  return process.env.NODE_ENV === 'development'
}

/**
 * Get environment variables
 * Usage
 * ```ts
 * import { getConfig } from '@app/config'
 * const config = getConfig()
 * ```
 */
export function getConfig(
  environmentVariables?: Record<string, string>,
): ParsedEnv {
  // eslint-disable-next-line no-process-env
  const env = environmentVariables ?? process.env

  // Normalize public env vars to secret env vars
  const normalizedEnv = {
    ...env,
    POSTHOG_API_KEY: env.POSTHOG_API_KEY ?? env.NEXT_PUBLIC_POSTHOG_API_KEY,
    SENTRY_DSN: env.SENTRY_DSN ?? env.NEXT_PUBLIC_SENTRY_DSN,
  }

  return envSchema.parse(normalizedEnv)
}
