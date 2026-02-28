export * from '@sindresorhus/is'
export { dedent } from 'ts-dedent'

/** Returns true when the user name matches the anonymized "Ghost" placeholder. */
export function isGhostUser(name: string): boolean {
  return name === 'Ghost'
}

/** MIME types accepted for document uploads. */
export const ALLOWED_DOCUMENT_TYPES = new Set([
  'text/csv',
  'text/plain',
  'text/html',
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
])

/** Value for the HTML `<input accept>` attribute — restricts the file picker. */
export const DOCUMENT_ACCEPT = [
  'text/csv',
  'text/plain',
  'text/html',
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  '.xlsx',
  '.xls',
  'image/*',
].join(',')
