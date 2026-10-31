// Shared by the Studio (to generate codes) and the writer portal (to check them).
// Only the SHA-256 hash of a code is stored in Sanity, never the code itself.

// No 0/O/1/I/L so codes are easy to read out or type
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

// 20 random characters (~98 bits), shown as XXXXX-XXXXX-XXXXX-XXXXX
export function generateAccessCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20))
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
  return chars.match(/.{5}/g)!.join('-')
}

export function normalizeAccessCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function hashAccessCode(code: string): Promise<string> {
  const data = new TextEncoder().encode(normalizeAccessCode(code))
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}
