import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const postsDirectory = path.join(rootDirectory, 'content', 'writing')
const publicDirectory = path.join(rootDirectory, 'public')
const allowedAssetExtensions = new Set([
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.mp4',
  '.pdf',
  '.png',
  '.svg',
  '.webm',
  '.webp'
])

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    asset: { type: 'string', multiple: true },
    date: { type: 'string' },
    description: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    slug: { type: 'string' },
    title: { type: 'string' }
  },
  strict: true
})

const slug = values.slug || positionals[0]
const title = values.title
const description = values.description
const date = values.date || new Date().toISOString().slice(0, 10)
const assets = values.asset || []

function fail(message) {
  console.error(`Blog scaffold failed: ${message}`)
  process.exit(1)
}

function yamlString(value) {
  return `'${value.replaceAll("'", "''")}'`
}

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  fail('provide a lowercase kebab-case slug with --slug (for example, bias-and-variance).')
}

if (!title?.trim()) {
  fail('provide a title with --title.')
}

if (!description?.trim()) {
  fail('provide a search description with --description.')
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
  fail('date must use YYYY-MM-DD.')
}

const postPath = path.join(postsDirectory, `${slug}.md`)
if (fs.existsSync(postPath)) {
  fail(`${path.relative(rootDirectory, postPath)} already exists.`)
}

const assetPlans = assets.map((source) => {
  const sourcePath = path.resolve(source)
  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    fail(`asset not found: ${source}`)
  }

  const extension = path.extname(sourcePath).toLowerCase()
  if (!allowedAssetExtensions.has(extension)) {
    fail(`unsupported asset type ${extension || '(none)'} for ${source}.`)
  }

  const fileName = path.basename(sourcePath)
  const relativeUrl = `/assets/writing/${slug}/${fileName}`
  const destinationPath = path.join(publicDirectory, relativeUrl)
  if (fs.existsSync(destinationPath)) {
    fail(`asset destination already exists: ${relativeUrl}`)
  }

  return { sourcePath, destinationPath, relativeUrl }
})

const figureExamples = assetPlans
  .filter(({ relativeUrl }) => /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(relativeUrl))
  .map(
    ({ relativeUrl }) =>
      `\n<ArticleFigure\n  src="${relativeUrl}"\n  alt="Describe the image"\n  caption="Optional caption"\n/>\n`
  )
  .join('')

const post = `---
title: ${yamlString(title.trim())}
date: ${yamlString(date)}
description: ${yamlString(description.trim())}
---

Write the opening here. The page header already displays the title, so start with the article body rather than another H1.

## First section

Write the section here.
${figureExamples}`

if (values['dry-run']) {
  console.log(`Would create: ${path.relative(rootDirectory, postPath)}`)
  for (const { relativeUrl } of assetPlans) console.log(`Would copy asset: ${relativeUrl}`)
  console.log('\n--- Preview ---\n')
  console.log(post)
  process.exit(0)
}

fs.mkdirSync(postsDirectory, { recursive: true })
fs.writeFileSync(postPath, post)

for (const { sourcePath, destinationPath } of assetPlans) {
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true })
  fs.copyFileSync(sourcePath, destinationPath)
}

console.log(`Created ${path.relative(rootDirectory, postPath)}`)
for (const { relativeUrl } of assetPlans) console.log(`Copied ${relativeUrl}`)
console.log(`Next: edit the post, then run "bun run blog:check -- ${slug}".`)
