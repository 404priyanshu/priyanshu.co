// Retrieval for the /ask chat: content/knowledge/*.md is split into one chunk
// per `##` section and ranked with BM25. The corpus is a few kilobytes, so an
// in-memory keyword index beats a vector database here: no embedding API, no
// extra service, and results that are easy to debug with
// `bun run knowledge:check -- "question"`.
//
// No `server-only` or `@/` imports, so the check script can load this file.

import fs from 'node:fs'
import path from 'node:path'

import { parse } from 'yaml'

const KNOWLEDGE_DIR = path.join(process.cwd(), 'content/knowledge')
const KEYWORDS_PATTERN = /<!--\s*keywords:([\s\S]*?)-->/gi
// Follow-up questions this chunk can answer, separated by `|`. Shown as
// suggestions after an answer that used the chunk, and indexed like keywords:
// they are the exact questions the chunk answers, so they sharpen matches.
const QUESTIONS_PATTERN = /<!--\s*questions:([\s\S]*?)-->/gi

// BM25 constants. These are the usual defaults; the corpus is too small to tune them.
const K1 = 1.2
const B = 0.75
// A heading names what its chunk is about, so its words count more than body words.
const HEADING_WEIGHT = 2
// Chunks below this share of the best score are noise for this query.
const RELATIVE_CUTOFF = 0.25
// Follow-up questions come only from chunks this close to the best match, so
// a weak match (ClassVault's phone OTP for "phone number") adds no off-topic
// suggestions.
const SUGGEST_CUTOFF = 0.5

const STOPWORDS = new Set(
  (
    'a an and are as at be been but by can could did do does for from had has have he her his how i if in into is it ' +
    'its me my of on or our she so tell than that the their them then there these they this to too us was we were ' +
    'what when where which who whom why will with would you your about any some all more most give list know please'
  ).split(' ')
)

function stem(token) {
  // Plural "s" only. Anything stronger mangles names such as "Ashby" or "Redis".
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss') && !token.endsWith('is')) {
    return token.slice(0, -1)
  }
  return token
}

export function tokenize(text) {
  return (
    text
      .toLowerCase()
      // "Next.js" and "llama.cpp" become "nextjs" and "llamacpp" in both documents and queries.
      .replace(/([a-z0-9])\.([a-z0-9])/g, '$1$2')
      .split(/[^a-z0-9+#]+/)
      .filter((token) => token.length > 1 && !STOPWORDS.has(token))
      .map(stem)
  )
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { data: {}, body: source }
  return { data: parse(match[1]) ?? {}, body: source.slice(match[0].length) }
}

function parseFile(fileName) {
  const source = fs.readFileSync(path.join(KNOWLEDGE_DIR, fileName), 'utf8')
  const { data, body } = splitFrontmatter(source)
  const topic = data.title ?? fileName.replace(/\.md$/, '')

  // Text before the first `##` is ignored: every chunk needs a heading to stand alone.
  return body
    .split(/^## /m)
    .slice(1)
    .map((section) => {
      const newline = section.indexOf('\n')
      const heading = (newline === -1 ? section : section.slice(0, newline)).trim()
      const rawBody = newline === -1 ? '' : section.slice(newline + 1)
      const keywords = [...rawBody.matchAll(KEYWORDS_PATTERN)].map((m) => m[1]).join(' ')
      const questions = [...rawBody.matchAll(QUESTIONS_PATTERN)]
        .flatMap((m) => m[1].split('|'))
        .map((question) => question.trim())
        .filter(Boolean)
      const text = rawBody.replace(KEYWORDS_PATTERN, '').replace(QUESTIONS_PATTERN, '').trim()

      const headingTokens = tokenize(`${topic} ${heading}`)
      const tokens = [
        ...Array.from({ length: HEADING_WEIGHT }, () => headingTokens).flat(),
        ...tokenize(keywords),
        ...tokenize(questions.join(' ')),
        ...tokenize(text)
      ]

      return {
        id: `${fileName.replace(/\.md$/, '')}#${slugify(heading)}`,
        topic,
        heading,
        text,
        pinned: data.pinned === true,
        questions,
        tokens
      }
    })
    .filter((chunk) => chunk.text)
}

function buildIndex() {
  const files = fs
    .readdirSync(KNOWLEDGE_DIR)
    .filter((file) => file.endsWith('.md') && file.toLowerCase() !== 'readme.md')
    .sort()

  const chunks = files.flatMap(parseFile).map((chunk) => {
    const termFrequency = new Map()
    for (const token of chunk.tokens) termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1)
    return { ...chunk, length: chunk.tokens.length, termFrequency }
  })

  const documentFrequency = new Map()
  for (const chunk of chunks) {
    for (const token of chunk.termFrequency.keys()) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)
    }
  }

  const averageLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0) / Math.max(chunks.length, 1)
  return { chunks, documentFrequency, averageLength }
}

let cachedIndex
function getIndex() {
  // Rebuild on every call in development so edits to the Markdown show up without a restart.
  if (process.env.NODE_ENV !== 'production') return buildIndex()
  cachedIndex ??= buildIndex()
  return cachedIndex
}

function bm25(chunk, queryTokens, { documentFrequency, averageLength, chunks }) {
  let score = 0
  for (const token of new Set(queryTokens)) {
    const tf = chunk.termFrequency.get(token)
    if (!tf) continue
    const df = documentFrequency.get(token) ?? 0
    const idf = Math.log(1 + (chunks.length - df + 0.5) / (df + 0.5))
    score += idf * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * chunk.length) / averageLength)))
  }
  return score
}

const publicChunk = ({ id, topic, heading, text, pinned, questions }) => ({
  id,
  topic,
  heading,
  text,
  pinned,
  questions
})

/**
 * Returns the pinned chunks plus up to `limit` chunks that best match `query`.
 * Each result has `id`, `topic`, `heading`, `text`, and (for ranked chunks) `score`.
 */
export function retrieve(query, { limit = 4 } = {}) {
  const index = getIndex()
  const queryTokens = tokenize(query)

  const pinned = index.chunks.filter((chunk) => chunk.pinned).map(publicChunk)
  const ranked = index.chunks
    .filter((chunk) => !chunk.pinned)
    .map((chunk) => ({ chunk, score: bm25(chunk, queryTokens, index) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]?.score ?? 0
  const matches = ranked
    .filter(({ score }) => score >= best * RELATIVE_CUTOFF)
    .slice(0, limit)
    .map(({ chunk, score }) => ({ ...publicChunk(chunk), score: Number(score.toFixed(3)) }))

  return [...pinned, ...matches]
}

const normalizeQuestion = (question) =>
  question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/**
 * Picks up to `limit` follow-up questions for the chunks `retrieve` returned.
 * It takes the first question of each matched chunk in rank order, then the
 * second, and so on, so the suggestions cover several topics. Pinned chunks
 * fill any gap. Questions already in `asked` are skipped.
 */
export function suggestQuestions(chunks, { asked = [], limit = 3 } = {}) {
  const seen = new Set(asked.map(normalizeQuestion))
  const picks = []
  const take = (question) => {
    const key = normalizeQuestion(question)
    if (picks.length >= limit || seen.has(key)) return
    seen.add(key)
    picks.push(question)
  }

  const ranked = chunks.filter((chunk) => !chunk.pinned)
  const best = Math.max(0, ...ranked.map((chunk) => chunk.score ?? 0))
  // Asked questions are dropped first, so a chunk whose first question was
  // just asked offers its next one in the same round.
  const queues = ranked
    .filter((chunk) => (chunk.score ?? 0) >= best * SUGGEST_CUTOFF)
    .map((chunk) => chunk.questions.filter((question) => !seen.has(normalizeQuestion(question))))
  const depth = Math.max(0, ...queues.map((queue) => queue.length))
  for (let round = 0; round < depth; round++) {
    for (const queue of queues) if (queue[round]) take(queue[round])
  }
  for (const chunk of chunks.filter((chunk) => chunk.pinned)) chunk.questions.forEach(take)
  return picks
}
