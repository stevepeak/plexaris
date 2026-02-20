import { getConfig } from '@app/config'
import { renderEmail } from '@app/email'
import { type ReactElement } from 'react'
import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(getConfig().RESEND_API_KEY)
  }
  return _resend
}

export async function sendEmail(
  to: string,
  subject: string,
  react: ReactElement,
): Promise<void> {
  const html = await renderEmail(react)
  const { error } = await getResend().emails.send({
    from: 'Plexaris <onboarding@resend.dev>',
    to,
    subject,
    html,
  })
  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }
}
