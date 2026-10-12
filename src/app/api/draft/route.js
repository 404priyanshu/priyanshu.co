import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

import { matchesSecret } from '@/lib/secrets'

export const dynamic = 'force-dynamic'

function isSafeRedirectPath(slug) {
  return slug?.startsWith('/') && !slug.startsWith('//') && !slug.includes('\\')
}

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret')

  // An unconfigured DRAFT_MODE_SECRET means "draft mode is off".
  if (!matchesSecret(secret, process.env.DRAFT_MODE_SECRET)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const slug = searchParams.get('slug')
  const draft = await draftMode()
  draft.enable()
  redirect(isSafeRedirectPath(slug) ? slug : '/')
}
