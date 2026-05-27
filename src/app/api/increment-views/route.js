import { NextResponse } from 'next/server'

import supabase from '@/lib/supabase/private'

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,120}$/i

export async function POST(request) {
  return handleRequest(request)
}

async function handleRequest(request) {
  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
  }

  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug parameter' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.rpc('increment_view_count', { page_slug: slug })

    if (error) {
      console.error('Supabase RPC error while incrementing views:', error.message)
      return NextResponse.json({ error: 'Unable to increment view count' }, { status: 500 })
    }

    const { data: verifyData, error: verifyError } = await supabase
      .from('views')
      .select('slug, count')
      .eq('slug', slug)
      .single()

    if (verifyError) {
      console.error('Supabase verification error while incrementing views:', verifyError.message)
    }

    return NextResponse.json(
      {
        message: 'View count incremented successfully',
        data,
        currentCount: verifyData
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected increment-views error:', error)
    return NextResponse.json({ error: 'Unable to increment view count' }, { status: 500 })
  }
}
