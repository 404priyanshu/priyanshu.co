import ip from '@arcjet/ip'
import { isbot } from 'isbot'
import { LRUCache } from 'lru-cache'
import { NextResponse } from 'next/server'

import supabase from '@/lib/supabase/private'

// Inlined at build time by next.config.mjs.
const POST_SLUGS = new Set((process.env.POST_SLUGS ?? '').split(',').filter(Boolean))

// Count one view per visitor and post in this window. The cache is per
// instance, so this is best effort: it stops reload loops, not a botnet.
const recentViews = new LRUCache({ max: 5000, ttl: 30 * 60 * 1000 })

async function incrementViews(slug) {
  const { error } = await supabase.rpc('increment_view_count', { page_slug: slug })
  if (error) console.error('Failed to increment views:', error.message)
}

export function proxy(request, event) {
  const { pathname } = request.nextUrl

  const writingSlug = pathname.match(/^\/writing\/([^/]+)$/)?.[1]
  const shouldTrackViews = process.env.NODE_ENV === 'production' || process.env.ENABLE_LOCAL_ANALYTICS === 'true'

  if (shouldTrackViews && supabase && POST_SLUGS.has(writingSlug) && !isbot(request.headers.get('user-agent'))) {
    const viewKey = `${ip(request, request.headers) || 'unknown'}:${writingSlug}`
    if (!recentViews.has(viewKey)) {
      recentViews.set(viewKey, true)
      event.waitUntil(incrementViews(writingSlug))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    {
      source: '/writing/:path*',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' }
      ]
    }
  ]
}
