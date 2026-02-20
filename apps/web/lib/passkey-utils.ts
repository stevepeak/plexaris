/**
 * Known AAGUID-to-authenticator-name mapping.
 * Source: https://github.com/passkeydeveloper/passkey-authenticator-aaguids
 */
const AAGUID_NAMES: Record<string, string> = {
  'fbfc3007-154e-4ecc-8c0b-6e020557d7bd': 'Apple Passwords',
  'dd4ec289-e01d-41c9-bb89-70fa845d4bf2': 'iCloud Keychain (Managed)',
  'ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4': 'Google Password Manager',
  'adce0002-35bc-c60a-648b-0b25f1f05503': 'Chrome on Mac',
  'b5397666-4885-aa6b-cebf-e52262a439a2': 'Chromium Browser',
  '771b48fd-d3d4-4f74-9232-fc157ab0507a': 'Edge on Mac',
  '08987058-cadc-4b81-b6e1-30de50dcbe96': 'Windows Hello',
  '9ddd1817-af5a-4672-a2b9-3e3dd95000a9': 'Windows Hello',
  '6028b017-b1d4-4c02-b4b3-afcdafc96bb2': 'Windows Hello',
  'bada5566-a7aa-401f-bd96-45619a55120d': '1Password',
  'd548826e-79b4-db40-a3d8-11116f7e8349': 'Bitwarden',
  '531126d6-e717-415c-9320-3d9aa6981239': 'Dashlane',
  'b84e4048-15dc-4dd0-8640-f4f60813c8af': 'NordPass',
  '0ea242b4-43c4-4a1b-8b17-dd6d0b6baec6': 'Keeper',
  'f3809540-7f14-49c1-a8b3-8f813b225541': 'Enpass',
  '891494da-2c90-4d31-a9cd-4eab0aed1309': 'Sésame',
  '53414d53-554e-4700-0000-000000000000': 'Samsung Pass',
  '39a5647e-1853-446c-a1f6-a79bae9f5bc7': 'IDmelon',
  'a11a5faa-9f32-4b8c-8c5d-2f7d13e8c942': 'AliasVault',
}

function getAuthenticatorName(aaguid: string | null): string | null {
  if (!aaguid) return null
  return AAGUID_NAMES[aaguid] ?? null
}

/**
 * Build a display name for a passkey from its AAGUID and stored name.
 *
 * Priority:
 *  1. AAGUID lookup → "1Password", "Apple Passwords", etc.
 *  2. Stored name (if not a generic placeholder)
 *  3. Fallback "Passkey"
 */
export function getPasskeyDisplayName(
  aaguid: string | null,
  storedName: string | null,
): string {
  const authenticator = getAuthenticatorName(aaguid)
  if (authenticator) return authenticator

  if (storedName && storedName !== 'My passkey') return storedName

  return 'Passkey'
}
