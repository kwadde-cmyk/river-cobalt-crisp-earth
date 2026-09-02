import { randomBytes } from 'node:crypto'

export const uiPort = 8080

/** rpcauth.py charset: A–Z a–z 0–9 _ -  and at least 20 chars. */
export function randomRpcPassword(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
  const bytes = randomBytes(32)
  let out = ''
  for (const b of bytes) out += alphabet[b % alphabet.length]
  return out
}
