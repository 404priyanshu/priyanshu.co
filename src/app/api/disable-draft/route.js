import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

import { matchesSecret } from '@/lib/secrets'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret')

  // An unconfigured DRAFT_MODE_SECRET means "draft mode is off".
  if (!matchesSecret(secret, process.env.DRAFT_MODE_SECRET)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const draft = await draftMode()
  draft.disable()

  return NextResponse.json({ messsage: 'Draft mode is disabled successfully', now: Date.now() }, { status: 200 })
}
