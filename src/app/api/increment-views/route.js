import { NextResponse } from 'next/server'

import supabase from '@/lib/supabase/private'
import { isDevelopment } from '@/lib/utils'

export async function POST(request) {
  return handleRequest(request)
}

export async function GET(request) {
  return handleRequest(request)
}

async function handleRequest(request) {
  console.log('=== INCREMENT VIEWS API CALLED ===')
  console.log('Method:', request.method)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('isDevelopment:', isDevelopment)

  // ADD DETAILED ENV CHECK
  console.log('🔗 SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ MISSING')
  console.log('🔑 SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ MISSING')

  // COMMENT OUT OR REMOVE THIS BLOCK FOR TESTING
  // if (isDevelopment) {
  //   console.log('❌ Blocked: Development mode')
  //   return NextResponse.json({ error: 'Not available in development' }, { status: 400 })
  // }

  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')
  console.log('📝 Slug received:', slug)

  if (!slug) {
    console.log('❌ Error: Missing slug parameter')
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
  }

  try {
    console.log('🔄 Calling Supabase RPC: increment_view_count with slug:', slug)
    const { data, error } = await supabase.rpc('increment_view_count', { page_slug: slug })

    if (error) {
      console.error('❌ Supabase RPC error:', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    console.log('✅ Success! View count incremented for slug:', slug)
    console.log('✅ RPC returned:', data)

    // Verify by reading back the count
    const { data: verifyData, error: verifyError } = await supabase
      .from('views')
      .select('slug, count')
      .eq('slug', slug)
      .single()

    if (verifyError) {
      console.log('⚠️ Could not verify count:', verifyError.message)
    } else {
      console.log('✅ Current count for', slug, ':', verifyData.count)
    }

    return NextResponse.json(
      {
        message: `View count incremented successfully for slug: ${slug}`,
        data,
        currentCount: verifyData
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Catch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
