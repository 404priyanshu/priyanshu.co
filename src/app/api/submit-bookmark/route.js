import ip from '@arcjet/ip'
import { isbot } from 'isbot'
import { NextResponse } from 'next/server'

import { formSchema } from '@/components/submit-bookmark/utils'
import { moderateBookmark } from '@/lib/moderation'
import { getPagePreview } from '@/lib/page-preview'
import { getBookmarks } from '@/lib/raindrop'
import rateLimit from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 600 * 1000, // 10 minutes (600 seconds * 1000 ms)
  uniqueTokenPerInterval: 500 // Max 500 IPs
})

export async function POST(req) {
  let json
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const data = await formSchema.safeParse(json)
  if (!data.success) {
    // The form shows `error` in a toast, so send the first message rather than
    // the ZodError itself, which would render as [object Object].
    const message = data.error.issues[0]?.message ?? 'Invalid submission.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (isbot(req.headers.get('User-Agent'))) {
    return NextResponse.json({ error: 'Bots are not allowed.' }, { status: 403 })
  }

  // Use the @arcjet/ip package to get the client's IP address. This looks at
  // the headers set by different hosting platforms to try and get the real IP
  // address before falling back to the request's remote address. This is
  // necessary because the IP headers could be spoofed. In non-production
  // environments we allow private/internal IPs.
  const clientIp = ip(req, req.headers)

  try {
    await limiter.check(5, clientIp) // Limit to 5 requests
  } catch {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
  }

  try {
    const { url, email, type } = data.data

    const [preview, bookmarks] = await Promise.all([getPagePreview(url), getBookmarks()])
    const moderation = await moderateBookmark({
      url,
      preview,
      collections: bookmarks.map((bookmark) => bookmark.title)
    })
    console.info('Bookmark moderation:', JSON.stringify({ url, ...moderation }))

    if (moderation?.decision === 'reject') {
      return NextResponse.json({ error: "This link doesn't look like something I'd bookmark." }, { status: 422 })
    }

    // Opt-in, so the submission keeps working against a table without the column.
    const moderationField = process.env.AIRTABLE_MODERATION_FIELD
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_BOOKMARKS_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          fields: {
            URL: url,
            Email: email,
            Date: new Date().toISOString(),
            Type: type || moderation?.suggestedCollection || 'Other',
            ...(moderationField && moderation && { [moderationField]: JSON.stringify(moderation) })
          }
        })
      }
    )

    const res = await response.json()

    if (!response.ok) {
      console.error('Airtable bookmark submission failed:', response.status)
      return NextResponse.json({ error: 'Error submitting bookmark.' }, { status: 502 })
    }

    return NextResponse.json({ res })
  } catch (error) {
    console.info(error)
    return NextResponse.json({ error: 'Error submitting bookmark.' }, { status: 500 })
  }
}
