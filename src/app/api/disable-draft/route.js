import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret')

  // Treat an unconfigured secret as "draft mode is off": without this an
  // empty DRAFT_MODE_SECRET would match an empty ?secret= and let anyone in.
  const draftModeSecret = process.env.DRAFT_MODE_SECRET
  if (!draftModeSecret || secret !== draftModeSecret) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const draft = await draftMode()
  draft.disable()

  return NextResponse.json({ messsage: 'Draft mode is disabled successfully', now: Date.now() }, { status: 200 })
}
