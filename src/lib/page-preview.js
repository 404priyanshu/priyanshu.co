import 'server-only'

import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

const TIMEOUT = 4000 // 4s
const MAX_BYTES = 256 * 1024 // 256 KB is plenty for the <head> and some body text
const MAX_REDIRECTS = 3
const EXCERPT_LENGTH = 1500

// The URL comes straight from a public form, so every hop is checked before it
// is fetched: http(s) only, default ports only, and no hostname that resolves
// to a loopback, private, link-local or otherwise non-public address.
// The response never reaches the submitter, only a moderation decision does,
// which limits what a DNS-rebinding race between this check and the fetch
// could leak.
const isPrivateIPv4 = (ip) => {
  const [a, b] = ip.split('.').map(Number)
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19))
  )
}

const isPrivateAddress = (ip) => {
  if (isIP(ip) === 4) return isPrivateIPv4(ip)

  const address = ip.toLowerCase()
  const dotted = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (dotted) return isPrivateIPv4(dotted[1])

  // IPv6 forms that embed an IPv4 address: mapped (::ffff:), the deprecated
  // compatible form (::) and NAT64 (64:ff9b::). The URL parser rewrites
  // [::ffff:127.0.0.1] as [::ffff:7f00:1], so the hex spelling has to be caught
  // here or it would pass as a public address.
  const embedded = address.match(/^(?:::ffff:|::|64:ff9b::)([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
  if (embedded) {
    const [high, low] = embedded.slice(1).map((group) => parseInt(group, 16))
    return isPrivateIPv4(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`)
  }

  return (
    address === '::' ||
    address === '::1' ||
    address.startsWith('fc') ||
    address.startsWith('fd') ||
    /^fe[89ab]/.test(address)
  )
}

async function assertPublicUrl(url) {
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Unsupported protocol')
  if (url.port && url.port !== '80' && url.port !== '443') throw new Error('Unsupported port')
  if (url.username || url.password) throw new Error('Credentials in URL')

  const hostname = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true })
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error('Non-public address')
  }
}

async function readCapped(response) {
  const reader = response.body.getReader()
  const chunks = []
  let size = 0

  while (size < MAX_BYTES) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    size += value.byteLength
  }
  await reader.cancel().catch(() => {})

  return new TextDecoder().decode(Buffer.concat(chunks).subarray(0, MAX_BYTES))
}

const decodeEntities = (text) =>
  text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

const clean = (text) =>
  decodeEntities(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()

const getMeta = (html, key) => {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []
  for (const tag of tags) {
    const name = tag.match(/\b(?:name|property)\s*=\s*["']([^"']+)["']/i)?.[1]
    if (name?.toLowerCase() !== key) continue
    return clean(
      tag
        .match(/\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i)
        ?.slice(1)
        .find(Boolean)
    )
  }
  return ''
}

function parseHtml(html) {
  const body = html
    .replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')

  return {
    title: clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]) || getMeta(html, 'og:title'),
    description: getMeta(html, 'description') || getMeta(html, 'og:description'),
    siteName: getMeta(html, 'og:site_name'),
    excerpt: clean(body).slice(0, EXCERPT_LENGTH)
  }
}

/**
 * Fetches just enough of a submitted page to judge what it is. Returns `null`
 * when the page cannot be read, which callers must treat as "unknown", never as
 * a signal on its own: plenty of real sites block unfamiliar user agents.
 */
export async function getPagePreview(rawUrl) {
  try {
    let url = new URL(rawUrl)

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertPublicUrl(url)

      const response = await fetch(url, {
        redirect: 'manual',
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT),
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': 'priyanshu.co bookmark preview (+https://priyanshu.co/bookmarks)'
        }
      })

      const location = response.headers.get('location')
      if (response.status >= 300 && response.status < 400 && location) {
        await response.body?.cancel()
        url = new URL(location, url)
        continue
      }

      const contentType = response.headers.get('content-type') ?? ''
      if (!response.ok || !contentType.includes('html')) {
        await response.body?.cancel()
        return null
      }

      return { url: url.href, ...parseHtml(await readCapped(response)) }
    }

    return null
  } catch (error) {
    console.info(`Page preview failed for ${rawUrl}: ${error?.message ?? error}`)
    return null
  }
}
