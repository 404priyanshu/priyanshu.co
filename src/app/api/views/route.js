import { NextResponse } from 'next/server'

import supabase from '@/lib/supabase/private'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  if (!supabase) {
    return NextResponse.json({ error: 'View tracking is unavailable' }, { status: 503 })
  }

  const slug = request.nextUrl.searchParams.get('slug')

  try {
    const query = supabase.from('views').select('slug, count')
    if (slug) query.eq('slug', slug)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Unable to fetch view counts:', error.message)
    return NextResponse.json({ error: 'Unable to fetch view counts' }, { status: 503 })
  }
}
