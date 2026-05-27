import { NextResponse } from 'next/server'

import { getAllPosts } from '@/lib/markdown'

export const dynamic = 'force-static'

export async function GET() {
  try {
    const posts = getAllPosts()
    const minimalPosts = posts.map((post) => ({
      title: post.title,
      slug: post.slug,
      date: post.date
    }))
    return NextResponse.json(minimalPosts, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error in API posts route:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
