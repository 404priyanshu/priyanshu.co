import { getAllPosts } from '@/lib/markdown'
import { pageMetadata } from '@/lib/seo'
import { getSortedPosts } from '@/lib/utils'

import WritingSlug from './[slug]/page'

// /writing shows the newest post in full, so the same text also lives at
// /writing/<slug>. The canonical URL and the share image point there, and the
// sitemap leaves /writing out.
export async function generateMetadata() {
  const [latest] = getSortedPosts(await getAllPosts())
  const path = latest ? `/writing/${latest.slug}` : '/writing'
  return pageMetadata({
    title: 'Writing',
    description: 'Notes on software, the web, and things learned by building.',
    path,
    ...(latest && {
      openGraph: { images: [{ url: `${path}/og.png`, width: 1200, height: 630, alt: latest.title }] }
    })
  })
}

export default async function Writing() {
  const posts = getSortedPosts(await getAllPosts())
  if (!posts.length) return null
  return <WritingSlug params={Promise.resolve({ slug: posts[0].slug })} />
}
