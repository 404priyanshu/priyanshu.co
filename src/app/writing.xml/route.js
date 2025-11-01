import { Feed } from 'feed'

import { getAllPosts } from '@/lib/markdown'
import { getSortedPosts } from '@/lib/utils'

export const dynamic = 'force-static'

export async function GET() {
  const allPosts = getAllPosts()
  const sortedPosts = getSortedPosts(allPosts)
  const date = new Date()
  const siteURL = 'https://priyanshu.me' // Change this to your domain
  const author = {
    name: 'Priyanshu Singh',
    link: siteURL
  }

  const feed = new Feed({
    title: `Writings RSS feed by ${author.name}`,
    description: 'Stay up to date with my latest writings',
    id: siteURL,
    link: `${siteURL}/writing`,
    language: 'en',
    copyright: `All rights reserved ${date.getFullYear()}, ${author.name}`,
    author,
    feedLinks: {
      rss2: `${siteURL}/writing.xml`
    }
  })

  sortedPosts.forEach((post) => {
    feed.addItem({
      id: post.slug,
      guid: post.slug,
      title: post.title,
      description: post.description || '',
      link: `${siteURL}/writing/${post.slug}`,
      date: new Date(post.date),
      author: [author]
    })
  })

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'max-age=172800, stale-while-revalidate=86400'
    }
  })
}
