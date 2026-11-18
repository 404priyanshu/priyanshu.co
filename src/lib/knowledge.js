// Retrieval for the /ask chat. Chunks come from content/knowledge/*.md and
// content/writing/*.md, one chunk per `##` section. BM25 always runs. When a
// matching embedding index is available, those hits are merged with reciprocal
// rank fusion. Any embedding problem leaves the BM25 result in place.
//
// No `server-only` or `@/` imports, so the check and eval scripts can load this file.

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { parse } from 'yaml'

import { embedQuery, loadEmbeddingStore, rankByEmbedding } from './embeddings.js'

const KNOWLEDGE_DIR = path.join(process.cwd(), 'content/knowledge')
const WRITING_DIR = path.join(process.cwd(), 'content/writing')
const SITE_URL = 'https://priyanshu.co'
// Fresh regexes per section. A shared /g pattern keeps lastIndex, so one
// section's match would hide the next section's notes.
const keywordsPattern = () => /<!--\s*keywords:([\s\S]*?)-->/gi
// Follow-up questions this chunk can answer, separated by `|`. Shown as
// suggestions after an answer that used the chunk, and indexed like keywords:
// they are the exact questions the chunk answers, so they sharpen matches.
const questionsPattern = () => /<!--\s*questions:([\s\S]*?)-->/gi

// BM25 constants. These are the usual defaults; the corpus is too small to tune them.
const K1 = 1.2
const B = 0.75
// A heading names what its chunk is about, so its words count more than body words.
const HEADING_WEIGHT = 2
// Chunks below this share of the best score are noise for a BM25-only query.
const RELATIVE_CUTOFF = 0.25
// Follow-up questions come only from chunks this close to the best match, so
// a weak match (ClassVault's phone OTP for "phone number") adds no off-topic
// suggestions.
const SUGGEST_CUTOFF = 0.5
// How many hits from each ranker RRF considers. A full-list fusion lets a
// mediocre keyword hit collect a second vote from the tail of the embedding
// list and crowd out a chunk that only the embedding model understood.
const CANDIDATE_DEPTH = 20
// Standard RRF constant. Rank 1 is worth 1/61, rank 2 is worth 1/62, and so on.
export const RRF_K = 60

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

function attribute(block, name) {
  const match = block.match(new RegExp(`\\b${name}="([^"]*)"`))
  return match?.[1]?.trim() ?? ''
}

// Figures and other article components are JSX the model should not repeat.
// Alt text and captions stay, because they describe the figure.
export function cleanText(raw) {
  return raw
    .replace(/<ArticleFigure\b[\s\S]*?\/>/g, (block) => {
      return [attribute(block, 'alt'), attribute(block, 'caption')].filter(Boolean).join('\n\n')
    })
    .replace(/<[A-Z][A-Za-z0-9]*\b[^>]*\/>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()
}

// `##` inside a fenced code sample is not a section. The resume post quotes
// the education chunk this way.
function splitSections(body) {
  const lines = body.split(/\r?\n/)
  let fence = null
  const preamble = []
  const sections = []
  let current = null
  const push = (line) => (current ? current.lines.push(line) : preamble.push(line))

  for (const line of lines) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)
    if (marker) {
      const token = marker[1][0]
      if (!fence) fence = token
      else if (token === fence) fence = null
      push(line)
      continue
    }
    if (!fence && line.startsWith('## ')) {
      current = { heading: line.slice(3).trim(), lines: [] }
      sections.push(current)
      continue
    }
    push(line)
  }

  return {
    preamble: preamble.join('\n'),
    sections: sections.map((section) => ({ heading: section.heading, body: section.lines.join('\n') }))
  }
}

function parseNotes(rawBody) {
  const keywords = [...rawBody.matchAll(keywordsPattern())].map((match) => match[1]).join(' ')
  const questions = [...rawBody.matchAll(questionsPattern())]
    .flatMap((match) => match[1].split('|'))
    .map((question) => question.trim())
    .filter(Boolean)
  const stripped = rawBody.replace(keywordsPattern(), '').replace(questionsPattern(), '')
  return { keywords, questions, text: cleanText(stripped) }
}

function buildChunk({ id, topic, heading, rawBody, pinned, source, href, url }) {
  const { keywords, questions, text } = parseNotes(rawBody)
  if (!text) return null

  const headingTokens = tokenize(`${topic} ${heading}`)
  const tokens = [
    ...Array.from({ length: HEADING_WEIGHT }, () => headingTokens).flat(),
    ...tokenize(keywords),
    ...tokenize(questions.join(' ')),
    ...tokenize(text)
  ]

  return { id, topic, heading, text, pinned, questions, tokens, source, href, url }
}

function uniqueId(base, used) {
  if (!used.has(base)) return base
  let n = 2
  while (used.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

function loadDirectory(directory, { source }) {
  if (!fs.existsSync(directory)) return []
  const files = fs
    .readdirSync(directory)
    .filter((file) => file.endsWith('.md') && file.toLowerCase() !== 'readme.md')
    .sort()

  return files.flatMap((fileName) => {
    const sourceText = fs.readFileSync(path.join(directory, fileName), 'utf8')
    const { data, body } = splitFrontmatter(sourceText)
    const fileSlug = fileName.replace(/\.md$/, '')
    const topic = data.title ?? fileSlug
    const pinned = data.pinned === true
    const href = source === 'writing' ? `/writing/${fileSlug}` : undefined
    const url = source === 'writing' ? `${SITE_URL}/writing/${fileSlug}` : undefined
    const idPrefix = source === 'writing' ? `writing/${fileSlug}` : fileSlug
    const { preamble, sections } = splitSections(body)
    const pieces = sections.map((section) => ({ heading: section.heading, rawBody: section.body }))

    // Resume files are a sequence of sections. Posts also have a lead-in
    // before the first heading, which is part of the article.
    if (source === 'writing') {
      const lead = preamble.replace(/^\s*#\s+[^\n]+\s*/, '')
      const intro = [typeof data.description === 'string' ? data.description.trim() : '', lead]
        .filter(Boolean)
        .join('\n\n')
      if (cleanText(intro).length >= 80) pieces.unshift({ heading: 'Introduction', rawBody: intro })
    }

    const used = new Set()
    return pieces
      .map((piece) => {
        const id = uniqueId(`${idPrefix}#${slugify(piece.heading)}`, used)
        used.add(id)
        return buildChunk({ id, topic, heading: piece.heading, rawBody: piece.rawBody, pinned, source, href, url })
      })
      .filter(Boolean)
  })
}

export function loadChunks() {
  return [
    ...loadDirectory(KNOWLEDGE_DIR, { source: 'knowledge' }),
    ...loadDirectory(WRITING_DIR, { source: 'writing' })
  ]
}

// What the embedding model reads. Kept stable: the index hash covers it, so a
// wording change here invalidates a stale file instead of mixing spaces.
export function embeddingDocument(chunk) {
  const kind = chunk.source === 'writing' ? 'Blog post' : 'Resume notes'
  return `${kind}\n${chunk.topic}\n${chunk.heading}\n\n${chunk.text}`.slice(0, 4000)
}

export function corpusHash(chunks) {
  const hash = createHash('sha256')
  for (const chunk of chunks) {
    hash.update(chunk.id)
    hash.update('\n')
    hash.update(embeddingDocument(chunk))
    hash.update('\n\n')
  }
  return hash.digest('hex')
}

function buildIndex() {
  const chunks = loadChunks().map((chunk) => {
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
  return { chunks, documentFrequency, averageLength, corpusHash: corpusHash(chunks) }
}

let cachedIndex
export function getIndex() {
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

function publicChunk({ id, topic, heading, text, pinned, questions, source, href, url }) {
  return { id, topic, heading, text, pinned, questions, source, href, url }
}

/**
 * Non-pinned chunks with a positive BM25 score, best first.
 * Each row is `{ chunk, score }`.
 */
export function rankBm25(query) {
  const index = getIndex()
  const queryTokens = tokenize(query)
  return index.chunks
    .filter((chunk) => !chunk.pinned)
    .map((chunk) => ({ chunk, score: bm25(chunk, queryTokens, index) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || (a.chunk.id < b.chunk.id ? -1 : 1))
}

/**
 * Merges rank lists with reciprocal rank fusion. Each list is best-first ids.
 * Returns `{ id, score }` best first. Ties break on the better single rank, then id.
 */
export function reciprocalRankFusion(rankings, { k = RRF_K } = {}) {
  const scores = new Map()
  const bestRank = new Map()
  for (const ranking of rankings) {
    ranking.forEach((id, index) => {
      const rank = index + 1
      scores.set(id, (scores.get(id) ?? 0) + 1 / (k + rank))
      bestRank.set(id, Math.min(bestRank.get(id) ?? rank, rank))
    })
  }
  return [...scores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score || bestRank.get(a.id) - bestRank.get(b.id) || (a.id < b.id ? -1 : 1))
}

export function fuseRankings(lexicalIds, denseIds) {
  return reciprocalRankFusion([lexicalIds.slice(0, CANDIDATE_DEPTH), denseIds.slice(0, CANDIDATE_DEPTH)])
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Embedding timed out')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

function resolveStore(hash, store) {
  if (!store?.vectors || !store.dimensions || !store.provider || !store.corpusHash) return null
  if (store.corpusHash !== hash) {
    console.error('Embedding index does not match the current notes; using BM25.')
    return null
  }
  return store
}

/**
 * Pinned chunks plus up to `limit` BM25 matches. The relative cutoff drops
 * weak scores. This is the result the chat uses whenever embeddings are off.
 */
export function retrieveBm25(query, { limit = 4 } = {}) {
  const index = getIndex()
  const pinned = index.chunks.filter((chunk) => chunk.pinned).map(publicChunk)
  const ranked = rankBm25(query)
  const best = ranked[0]?.score ?? 0
  const matches = ranked
    .filter(({ score }) => score >= best * RELATIVE_CUTOFF)
    .slice(0, limit)
    .map(({ chunk, score }) => ({ ...publicChunk(chunk), score: Number(score.toFixed(3)) }))
  return [...pinned, ...matches]
}

function hybridChunks(query, queryVector, store, limit) {
  const index = getIndex()
  const pinned = index.chunks.filter((chunk) => chunk.pinned).map(publicChunk)
  const byId = new Map(index.chunks.map((chunk) => [chunk.id, chunk]))
  const lexicalIds = rankBm25(query).map(({ chunk }) => chunk.id)
  const denseIds = rankByEmbedding(
    queryVector,
    store,
    index.chunks.filter((chunk) => !chunk.pinned).map((chunk) => chunk.id)
  )
  const fused = fuseRankings(lexicalIds, denseIds).slice(0, limit)
  const matches = fused
    .map(({ id, score }) => {
      const chunk = byId.get(id)
      if (!chunk) return null
      return { ...publicChunk(chunk), score: Number(score.toFixed(6)) }
    })
    .filter(Boolean)
  return [...pinned, ...matches]
}

/**
 * Hybrid retrieval when it can run, otherwise the same object shape as a
 * BM25-only search. `mode` is `hybrid` or `bm25`.
 *
 * Pass `embeddings` to skip the file (tests, and the eval script). `null`
 * forces the BM25 path. Pass `embedQuery` to replace the network or model call.
 */
export async function retrieveDetailed(query, { limit = 4, embeddings, embedQuery: embedOverride } = {}) {
  const lexical = retrieveBm25(query, { limit })
  const index = getIndex()
  const store = resolveStore(index.corpusHash, embeddings === undefined ? loadEmbeddingStore() : embeddings)
  if (!store) return { mode: 'bm25', chunks: lexical }

  let queryVector
  try {
    const embed = embedOverride ?? ((text) => embedQuery(text, store))
    // The local model loads in about a tenth of a second once the files are on
    // disk. The cap keeps a stuck embedding call from holding the answer.
    queryVector = await withTimeout(
      Promise.resolve().then(() => embed(query)),
      4000
    )
  } catch (error) {
    console.error(`Embedding retrieval failed; using BM25. ${error?.message ?? error}`)
    return { mode: 'bm25', chunks: lexical }
  }

  if (!Array.isArray(queryVector) || queryVector.length !== store.dimensions) {
    if (queryVector) console.error('Embedding retrieval failed; using BM25. The query vector does not match the index.')
    return { mode: 'bm25', chunks: lexical }
  }

  return { mode: 'hybrid', chunks: hybridChunks(query, queryVector, store, limit) }
}

export async function retrieve(query, options) {
  return (await retrieveDetailed(query, options)).chunks
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
