import { NextResponse } from 'next/server'

import supabase from '@/lib/supabase/private'
import { isDevelopment } from '@/lib/utils'

export async function POST(request) {
  return handleRequest(request)
}

// Add GET handler for debugging
export async function GET(request) {
  return handleRequest(request)
}

async function handleRequest(request) {
  console.log('=== INCREMENT VIEWS API CALLED ===')
  console.log('Method:', request.method)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('isDevelopment:', isDevelopment)

  if (isDevelopment) {
    console.log('❌ Blocked: Development mode')
    return NextResponse.json({ error: 'Not available in development' }, { status: 400 })
  }

  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')
  console.log('Slug received:', slug)

  if (!slug) {
    console.log('❌ Error: Missing slug parameter')
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
  }

  try {
    console.log('🔄 Calling Supabase RPC: increment_view_count with slug:', slug)
    const { data, error } = await supabase.rpc('increment_view_count', { page_slug: slug })

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Success! View count incremented for slug:', slug)
    return NextResponse.json(
      {
        message: `View count incremented successfully for slug: ${slug}`,
        data
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Catch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
