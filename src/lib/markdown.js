import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/writing')

// Get all post files
export function getPostSlugs() {
  try {
    if (!fs.existsSync(postsDirectory)) {
      console.log('Creating posts directory:', postsDirectory)
      fs.mkdirSync(postsDirectory, { recursive: true })
      return []
    }
    const files = fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.md'))
    console.log('Found post files:', files)
    return files
  } catch (error) {
    console.error('Error reading posts directory:', error)
    return []
  }
}

// Get post data by slug
export function getPostBySlug(slug) {
  try {
    const realSlug = slug.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, `${realSlug}.md`)

    console.log('Looking for post at:', fullPath)

    if (!fs.existsSync(fullPath)) {
      console.error('Post not found at:', fullPath)
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    console.log('Post loaded:', realSlug, 'with data:', data)

    return {
      slug: realSlug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      description: data.description || '',
      content,
      ...data,
      sys: {
        firstPublishedAt: data.date || new Date().toISOString(),
        publishedAt: data.date || new Date().toISOString()
      }
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

// Get all posts
export function getAllPosts() {
  try {
    const slugs = getPostSlugs()
    console.log('Getting all posts for slugs:', slugs)

    const posts = slugs
      .map((slug) => getPostBySlug(slug.replace(/\.md$/, '')))
      .filter(Boolean)
      .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))

    console.log('Total posts loaded:', posts.length)
    return posts
  } catch (error) {
    console.error('Error in getAllPosts:', error)
    return []
  }
}

// Get all post slugs (for static generation)
export function getAllPostSlugs() {
  const slugs = getPostSlugs()
  return slugs.map((filename) => ({
    slug: filename.replace(/\.md$/, '')
  }))
}
