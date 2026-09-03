import { randomBytes } from 'node:crypto'

export const uiPort = 8080

/** Core username pattern: A–Z a–z 0–9 _  (no hyphen). */
export function randomRpcUsername(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = randomBytes(4)
  let suf = ''
  for (const b of bytes) suf += alphabet[b % alphabet.length]!
  return `scriptwerk_${suf}`
}

/** rpcauth.py charset: A–Z a–z 0–9 _ -  and at least 20 chars. */
export function randomRpcPassword(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
  const bytes = randomBytes(32)
  let out = ''
  for (const b of bytes) out += alphabet[b % alphabet.length]!
  return out
}
