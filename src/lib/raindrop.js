import 'server-only'

import { COLLECTION_IDS } from '@/lib/constants'

const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_RAINDROP_ACCESS_TOKEN}`
  },
  next: {
    revalidate: 60 * 10, // 10 minutes
    tags: ['bookmarks']
  },
  signal: AbortSignal.timeout(10000)
}

const RAINDROP_API_URL = 'https://api.raindrop.io/rest/v1'

export const getBookmarkItems = async (id, pageIndex = 0) => {
  if (!id) throw new Error('Bookmark ID is required')
  if (typeof pageIndex !== 'number' || pageIndex < 0) {
    throw new Error('Invalid page index')
  }

  try {
    const response = await fetch(
      `${RAINDROP_API_URL}/raindrops/${id}?` +
        new URLSearchParams({
          page: pageIndex,
          perpage: 50
        }),
      {
        ...options,
        next: {
          ...options.next,
          tags: ['bookmarks', `bookmark-${id}`]
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch bookmark items: ${error.message}`)
    return null
  }
}

export const getBookmarks = async () => {
  try {
    const response = await fetch(`${RAINDROP_API_URL}/collections`, options)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const bookmarks = await response.json()
    return bookmarks.items.filter((bookmark) => COLLECTION_IDS.includes(bookmark._id))
  } catch (error) {
    console.error(`Failed to fetch bookmarks: ${error.message}`)
    return null
  }
}

export const getBookmark = async (id) => {
  try {
    const response = await fetch(`${RAINDROP_API_URL}/collection/${id}`, {
      ...options,
      next: {
        ...options.next,
        tags: ['bookmarks', `bookmark-${id}`]
      }
    })
    return await response.json()
  } catch (error) {
    console.info(error)
    return null
  }
}
