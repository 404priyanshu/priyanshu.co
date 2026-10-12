import 'server-only'

import { createHash, timingSafeEqual } from 'node:crypto'

const digest = (value) => createHash('sha256').update(value).digest()

/**
 * Compares a request's secret with the configured one in constant time.
 * Returns false when the secret is not configured, so an unset or empty
 * environment variable never matches a crafted value.
 */
export function matchesSecret(provided, expected) {
  if (!expected || typeof provided !== 'string') return false
  // Hashing first gives both sides the same length, which timingSafeEqual needs.
  return timingSafeEqual(digest(provided), digest(expected))
}
