import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // eslint-disable-next-line no-process-env
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  // eslint-disable-next-line no-process-env
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  // eslint-disable-next-line no-process-env
  environment: process.env.NODE_ENV ?? 'production',
})
