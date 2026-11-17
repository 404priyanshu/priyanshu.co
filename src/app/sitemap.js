import { getAllPosts } from '@/lib/markdown'
import { getBookmarks } from '@/lib/raindrop'
import { SITE_URL } from '@/lib/seo'
import { getSortedPosts } from '@/lib/utils'

// Indexable pages that are not posts or bookmark collections. /writing is left out
// because its canonical URL is the newest post (it renders that post in full), and
// /lab is noindex.
const STATIC_PAGES = [
  { path: '/projects', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/journey', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/bookmarks', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/stack', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/workspace', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/books', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/ask', changeFrequency: 'monthly', priority: 0.6 }
]

// Only real dates go in `lastModified`. Google ignores a date that changes on every
// crawl, so pages without a known edit date leave the field out.
export default async function sitemap() {
  const posts = getSortedPosts(await getAllPosts())

  const home = {
    url: SITE_URL,
    ...(posts[0] && { lastModified: new Date(posts[0].date) }),
    changeFrequency: 'weekly',
    priority: 1
  }

  const staticPages = STATIC_PAGES.map(({ path, ...rest }) => ({ url: `${SITE_URL}${path}`, ...rest }))

  const writings = posts.map((post) => ({
    url: `${SITE_URL}/writing/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.8
  }))

  let bookmarks = []
  try {
    bookmarks = ((await getBookmarks()) ?? []).map((bookmark) => ({
      url: `${SITE_URL}/bookmarks/${bookmark.slug}`,
      changeFrequency: 'weekly',
      priority: 0.5
    }))
  } catch (error) {
    console.error('Error fetching bookmarks for sitemap:', error)
  }

  return [home, ...staticPages, ...writings, ...bookmarks]
}
