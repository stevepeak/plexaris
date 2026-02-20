export * from '@sindresorhus/is'
export { dedent } from 'ts-dedent'

/** Returns true when the user name matches the anonymized "Ghost" placeholder. */
export function isGhostUser(name: string): boolean {
  return name === 'Ghost'
}
