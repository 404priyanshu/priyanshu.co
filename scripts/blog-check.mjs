import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { parse } from 'yaml'

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const postsDirectory = path.join(rootDirectory, 'content', 'writing')
const allowedComponents = new Set(['ArticleFigure', 'BiasVarianceEquation', 'BiasVarianceTradeoff'])

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    slug: { type: 'string' }
  },
  strict: true
})

const requestedSlug = values.slug || positionals[0]

function parsePost(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { source, body: source, frontmatter: null }

  try {
    return {
      source,
      body: source.slice(match[0].length),
      frontmatter: parse(match[1]) || {}
    }
  } catch (error) {
    return { source, body: '', frontmatter: null, frontmatterError: error.message }
  }
}

function localAssetReferences(source) {
  const references = new Set()
  const patterns = [/!\[[^\]]*\]\((\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/g, /\bsrc=["'](\/[^"']+)["']/g]

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) references.add(match[1])
  }

  return [...references]
}

function withoutFencedCode(source) {
  return source.replace(/^(?:```|~~~)[^\n]*\n[\s\S]*?^(?:```|~~~)\s*$/gm, '')
}

function validatePost(filePath, includeStyleWarnings) {
  const slug = path.basename(filePath, '.md')
  const { source, body, frontmatter, frontmatterError } = parsePost(filePath)
  const renderedSource = withoutFencedCode(source)
  const renderedBody = withoutFencedCode(body)
  const errors = []
  const warnings = []

  if (frontmatterError) errors.push(`invalid YAML frontmatter: ${frontmatterError}`)
  if (!frontmatter) errors.push('missing YAML frontmatter')

  if (frontmatter) {
    if (typeof frontmatter.title !== 'string' || !frontmatter.title.trim()) errors.push('frontmatter.title is required')
    if (typeof frontmatter.description !== 'string' || !frontmatter.description.trim()) {
      errors.push('frontmatter.description is required')
    } else if (frontmatter.description.length > 180) {
      warnings.push(`description is ${frontmatter.description.length} characters; aim for 180 or fewer`)
    }

    const date = String(frontmatter.date || '')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
      errors.push('frontmatter.date must use YYYY-MM-DD')
    }

    const firstHeading = renderedBody.match(/^# ([^\n]+)$/m)?.[1]?.trim()
    if (includeStyleWarnings && firstHeading && firstHeading === frontmatter.title.trim()) {
      warnings.push('remove the duplicate H1; the article page already renders the title')
    }
  }

  if (body.trim().length < 100) errors.push('article body is too short or empty')

  const componentNames = [...renderedSource.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1])
  for (const componentName of new Set(componentNames)) {
    if (!allowedComponents.has(componentName)) {
      errors.push(`unknown article component <${componentName}>; register it in the renderer or use <ArticleFigure>`)
    }
  }

  for (const reference of localAssetReferences(renderedSource)) {
    const cleanReference = decodeURIComponent(reference.split(/[?#]/, 1)[0])
    const assetPath = path.join(rootDirectory, 'public', cleanReference.replace(/^\/+/, ''))
    if (!fs.existsSync(assetPath)) errors.push(`missing local asset ${reference}`)
  }

  const wordCount = body
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  return { slug, errors, warnings, wordCount }
}

if (!fs.existsSync(postsDirectory)) {
  console.error('Blog validation failed: content/writing does not exist.')
  process.exit(1)
}

let files = fs
  .readdirSync(postsDirectory)
  .filter((file) => file.endsWith('.md'))
  .map((file) => path.join(postsDirectory, file))

if (requestedSlug) {
  const requestedPath = path.join(postsDirectory, `${requestedSlug.replace(/\.md$/, '')}.md`)
  if (!fs.existsSync(requestedPath)) {
    console.error(`Blog validation failed: content/writing/${requestedSlug.replace(/\.md$/, '')}.md does not exist.`)
    process.exit(1)
  }
  files = [requestedPath]
}

const results = files.map((filePath) => validatePost(filePath, Boolean(requestedSlug)))
let errorCount = 0
let warningCount = 0

for (const result of results) {
  console.log(`${result.errors.length > 0 ? '✗' : '✓'} ${result.slug} (${result.wordCount} words)`)
  for (const warning of result.warnings) {
    warningCount += 1
    console.log(`  warning: ${warning}`)
  }
  for (const error of result.errors) {
    errorCount += 1
    console.log(`  error: ${error}`)
  }
}

console.log(
  `\nChecked ${results.length} post${results.length === 1 ? '' : 's'}: ${errorCount} errors, ${warningCount} warnings.`
)
if (errorCount > 0) process.exit(1)
