import { render } from '@react-email/components'
import { type ReactElement } from 'react'

export async function renderEmail(
  email: ReactElement,
  options?: { plainText?: boolean },
): Promise<string> {
  return render(email, options)
}
