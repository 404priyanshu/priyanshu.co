import { getAllPosts } from '@/lib/markdown'
import { getBookmarks } from '@/lib/raindrop'
import { getSortedPosts } from '@/lib/utils'

export default async function sitemap() {
  const siteURL = 'https://priyanshu.me'

  try {
    const allPosts = await getAllPosts()
    const sortedWritings = getSortedPosts(allPosts)

    // Writing/blog posts
    const writings = sortedWritings.map((post) => {
      return {
        url: `${siteURL}/writing/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.7
      }
    })

    // Bookmarks - with error handling
    let mappedBookmarks = []
    try {
      const bookmarks = await getBookmarks()
      if (bookmarks) {
        mappedBookmarks = bookmarks.map((bookmark) => {
          return {
            url: `${siteURL}/bookmarks/${bookmark.slug}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.6
          }
        })
      }
    } catch (error) {
      console.error('Error fetching bookmarks for sitemap:', error)
    }

    // Static pages
    const staticPages = [
      {
        url: siteURL,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1
      },
      {
        url: `${siteURL}/writing`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9
      },
      {
        url: `${siteURL}/journey`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8
      },
      {
        url: `${siteURL}/stack`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7
      },
      {
        url: `${siteURL}/workspace`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7
      },
      {
        url: `${siteURL}/bookmarks`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8
      }
    ]

    return [...staticPages, ...writings, ...mappedBookmarks]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return [
      {
        url: siteURL,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1
      }
    ]
  }
}
