import { NextResponse } from 'next/server'

export function middleware(request, event) {
  const { pathname } = request.nextUrl
  console.log('🔍 Middleware triggered for:', pathname)

  const writingSlug = pathname.match(/\/writing\/(.*)/)?.[1]
  console.log('📝 Extracted slug:', writingSlug)

  async function sendAnalytics() {
    const URL =
      process.env.NODE_ENV === 'production'
        ? 'https://priyanshu.me/api/increment-views'
        : 'http://localhost:3000/api/increment-views'

    console.log('📤 Sending analytics to:', `${URL}?slug=${writingSlug}`)

    try {
      const res = await fetch(`${URL}?slug=${writingSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      })

      console.log('📥 Analytics response:', res.status)
      if (res.status !== 200) {
        const errorText = await res.text()
        console.error('❌ Failed to send analytics:', res.status, errorText)
      } else {
        const data = await res.json()
        console.log('✅ Analytics sent successfully:', data)
      }
    } catch (error) {
      console.error('❌ Error sending analytics:', error)
    }
  }

  if (writingSlug) {
    console.log('✅ Calling sendAnalytics for slug:', writingSlug)
    event.waitUntil(sendAnalytics())
  } else {
    console.log('⚠️ No writing slug found, skipping analytics')
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
