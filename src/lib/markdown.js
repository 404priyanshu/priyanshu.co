import fs from 'fs'
import path from 'path'
import { parse } from 'yaml'

const postsDirectory = path.join(process.cwd(), 'content/writing')

function parseFrontmatter(fileContents) {
  const match = fileContents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)

  if (!match) {
    return {
      data: {},
      content: fileContents
    }
  }

  return {
    data: parse(match[1]) ?? {},
    content: fileContents.slice(match[0].length)
  }
}

// Get all post files
export function getPostSlugs() {
  try {
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true })
      return []
    }
    const files = fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.md'))
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

    if (!fs.existsSync(fullPath)) {
      console.error('Post not found at:', fullPath)
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = parseFrontmatter(fileContents)

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

    const posts = slugs
      .map((slug) => getPostBySlug(slug.replace(/\.md$/, '')))
      .filter(Boolean)
      .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))

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
