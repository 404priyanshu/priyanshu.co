import { NextResponse } from 'next/server'

export function middleware(request, event) {
  const { pathname } = request.nextUrl

  const writingSlug = pathname.match(/^\/writing\/([^/]+)$/)?.[1]
  const shouldTrackViews = process.env.NODE_ENV === 'production' || process.env.ENABLE_LOCAL_ANALYTICS === 'true'

  async function sendAnalytics() {
    const URL =
      process.env.NODE_ENV === 'production'
        ? 'https://priyanshu.me/api/increment-views'
        : 'http://localhost:3000/api/increment-views'

    try {
      const res = await fetch(`${URL}?slug=${writingSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      })

      if (res.status !== 200) {
        console.error('Failed to send analytics:', res.status)
      }
    } catch (error) {
      console.error('Error sending analytics:', error)
    }
  }

  if (writingSlug && shouldTrackViews) {
    event.waitUntil(sendAnalytics())
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
