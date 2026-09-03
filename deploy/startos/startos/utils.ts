import { randomBytes } from 'node:crypto'

export const uiPort = 8080

const USER_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

/** Core username = [A-Za-z0-9_]+  — hyphen is rejected, so scriptwerk_xxxxxxxx. */
export function randomRpcUsername(): string {
  const bytes = randomBytes(8)
  let suf = ''
  for (const b of bytes) suf += USER_ALPHABET[b % USER_ALPHABET.length]!
  return `scriptwerk_${suf}`
}

export function isGeneratedRpcUser(user: string): boolean {
  return /^scriptwerk_[a-z0-9]{8}$/.test(user)
}

/** rpcauth.py charset, 32 random chars (not a constant). */
export function randomRpcPassword(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
  const bytes = randomBytes(32)
  let out = ''
  for (const b of bytes) out += alphabet[b % alphabet.length]!
  return out
}
