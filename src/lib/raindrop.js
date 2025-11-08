'use server'

import 'server-only'

import { COLLECTION_IDS } from '@/lib/constants'

const DEFAULT_TIMEOUT = 30000 // 30s

// Prefer server-only token, fallback to NEXT_PUBLIC for compatibility
const token = process.env.RAINDROP_TOKEN || process.env.NEXT_PUBLIC_RAINDROP_ACCESS_TOKEN

// DEBUG: presence & length only (never log the token itself). Remove after verifying.
try {
  console.info('RAINDROP token present:', Boolean(token))
  console.info('RAINDROP token length:', token ? token.length : 0)
} catch (e) {
  // ignore in restricted environments
}

const commonHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
}

const baseFetchOptions = {
  method: 'GET',
  headers: commonHeaders,
  next: {
    revalidate: 60 * 10, // 10 minutes
    tags: ['bookmarks']
  }
}

async function safeFetch(url, opts = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) {
      let body = ''
      try {
        body = await res.text()
      } catch (e) {
        body = '<unable to read body>'
      }
      throw new Error(`HTTP ${res.status}: ${body}`)
    }

    return res
  } catch (err) {
    clearTimeout(timeout)
    console.error(`Fetch error for ${url}: ${err?.message ?? err}`)
    throw err
  }
}

const RAINDROP_API_URL = 'https://api.raindrop.io/rest/v1'

export const getBookmarkItems = async (id, pageIndex = 0) => {
  if (!id) throw new Error('Bookmark ID is required')
  if (typeof pageIndex !== 'number' || pageIndex < 0) {
    throw new Error('Invalid page index')
  }

  try {
    const url =
      `${RAINDROP_API_URL}/raindrops/${id}?` +
      new URLSearchParams({
        page: pageIndex,
        perpage: 50
      })

    const response = await safeFetch(url, {
      ...baseFetchOptions,
      next: {
        ...baseFetchOptions.next,
        tags: ['bookmarks', `bookmark-${id}`]
      }
    })

    const data = await response.json()
    return data ?? { items: [] }
  } catch (error) {
    console.error(`Failed to fetch bookmark items: ${error?.message ?? error}`)
    return { items: [] }
  }
}

export const getBookmarks = async () => {
  try {
    const response = await safeFetch(`${RAINDROP_API_URL}/collections`, baseFetchOptions)
    const bookmarks = await response.json()
    const items = bookmarks?.items ?? []
    return items.filter((bookmark) => COLLECTION_IDS.includes(bookmark._id))
  } catch (error) {
    console.error(`Failed to fetch bookmarks: ${error?.message ?? error}`)
    return []
  }
}

export const getBookmark = async (id) => {
  try {
    const response = await safeFetch(`${RAINDROP_API_URL}/collection/${id}`, {
      ...baseFetchOptions,
      next: {
        ...baseFetchOptions.next,
        tags: ['bookmarks', `bookmark-${id}`]
      }
    })
    return await response.json()
  } catch (error) {
    console.info(error)
    return null
  }
}
