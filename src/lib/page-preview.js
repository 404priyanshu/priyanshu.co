import 'server-only'

import { lookup } from 'node:dns/promises'
import http from 'node:http'
import https from 'node:https'
import { isIP } from 'node:net'

const TIMEOUT = 4000 // 4s
const MAX_BYTES = 256 * 1024 // 256 KB is plenty for the <head> and some body text
const MAX_REDIRECTS = 3
const EXCERPT_LENGTH = 1500

// The URL comes straight from a public form, so every hop is checked before it
// is fetched: http(s) only, default ports only, and no hostname that resolves
// to a loopback, private, link-local or otherwise non-public address.
// The address check runs inside the socket's DNS lookup, so the connection
// uses the exact addresses that passed it: DNS rebinding has no window.
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

  const [first, second, third, fourth] = expandIPv6(address)
  return (
    address === '::' ||
    address === '::1' ||
    [first, second, third, fourth].some(Number.isNaN) ||
    (first & 0xfe00) === 0xfc00 || // fc00::/7 unique local
    (first & 0xffc0) === 0xfe80 || // fe80::/10 link-local
    (first & 0xff00) === 0xff00 || // ff00::/8 multicast
    first === 0x2002 || // 2002::/16 6to4, embeds any IPv4 address
    (first === 0x2001 && second === 0) || // 2001::/32 Teredo
    (first === 0x2001 && second === 0x0db8) || // 2001:db8::/32 documentation
    (first === 0x0100 && second === 0 && third === 0 && fourth === 0) // 100::/64 discard
  )
}

// Expands an IPv6 address to its eight 16-bit groups. A group that is not hex
// (such as a dotted IPv4 tail) becomes NaN, which the caller treats as private.
const expandIPv6 = (address) => {
  const [head, tail] = address.split('::')
  const headGroups = head ? head.split(':') : []
  const tailGroups = tail ? tail.split(':') : []
  const groups =
    tail === undefined
      ? headGroups
      : [...headGroups, ...Array(8 - headGroups.length - tailGroups.length).fill('0'), ...tailGroups]
  return groups.map((group) => (/^[0-9a-f]{1,4}$/.test(group) ? parseInt(group, 16) : NaN))
}

function assertAllowedUrl(url) {
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Unsupported protocol')
  if (url.port && url.port !== '80' && url.port !== '443') throw new Error('Unsupported port')
  if (url.username || url.password) throw new Error('Credentials in URL')

  // Sockets skip the DNS lookup for an IP literal, so check it here.
  const hostname = url.hostname.replace(/^\[|\]$/g, '')
  if (isIP(hostname) && isPrivateAddress(hostname)) throw new Error('Non-public address')
}

// Used as the socket's lookup, so the connection goes to an address checked here.
function publicLookup(hostname, options, callback) {
  lookup(hostname, { all: true }).then((addresses) => {
    if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
      callback(new Error('Non-public address'))
    } else if (options.all) {
      callback(null, addresses)
    } else {
      callback(null, addresses[0].address, addresses[0].family)
    }
  }, callback)
}

function request(url) {
  const client = url.protocol === 'https:' ? https : http
  return new Promise((resolve, reject) => {
    client
      .get(
        url,
        {
          lookup: publicLookup,
          signal: AbortSignal.timeout(TIMEOUT),
          headers: {
            Accept: 'text/html,application/xhtml+xml',
            'User-Agent': 'priyanshu.co bookmark preview (+https://priyanshu.co/bookmarks)'
          }
        },
        resolve
      )
      .on('error', reject)
  })
}

async function readCapped(response) {
  const chunks = []
  let size = 0

  for await (const chunk of response) {
    chunks.push(chunk)
    size += chunk.byteLength
    if (size >= MAX_BYTES) break
  }
  response.destroy()

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
      assertAllowedUrl(url)

      const response = await request(url)
      const { statusCode } = response

      const { location } = response.headers
      if (statusCode >= 300 && statusCode < 400 && location) {
        response.destroy()
        url = new URL(location, url)
        continue
      }

      const contentType = response.headers['content-type'] ?? ''
      // No Accept-Encoding is sent, so a compressed body is unexpected and unreadable.
      const encoding = response.headers['content-encoding'] ?? 'identity'
      if (statusCode < 200 || statusCode >= 300 || !contentType.includes('html') || encoding !== 'identity') {
        response.destroy()
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
