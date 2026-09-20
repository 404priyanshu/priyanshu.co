import { getAllPosts } from '@/lib/markdown'
import { getSortedPosts } from '@/lib/utils'

import WritingSlug from './[slug]/page'

export const metadata = {
  title: 'Writing',
  description: 'Notes on software, the web, and things learned by building.'
}

export default async function Writing() {
  const posts = getSortedPosts(await getAllPosts())
  if (!posts.length) return null
  return <WritingSlug params={Promise.resolve({ slug: posts[0].slug })} />
}
