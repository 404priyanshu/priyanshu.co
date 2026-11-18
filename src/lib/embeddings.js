// Query-time embeddings for hybrid retrieval.
//
// Document vectors are precomputed (`bun run knowledge:embed`) and stored in
// data/ask-embeddings.json. This module only embeds the question, then dots it
// with those vectors. A few hundred dots do not need a vector database.
//
// The committed index uses a small local model (all-MiniLM-L6-v2) so hybrid
// search works without an API key. `bun run knowledge:embed` with
// EMBEDDING_PROVIDER=openai rebuilds the index using text-embedding-3-small
// through the OpenAI SDK. The file records which space it is in. A missing
// key, a failed call, a missing file, or a hash that does not match the
// current Markdown all make the caller keep its BM25 ranking.

import fs from 'node:fs'
import path from 'node:path'

import OpenAI from 'openai'

export const EMBEDDINGS_PATH = path.join(process.cwd(), 'data/ask-embeddings.json')
export const LOCAL_MODEL_ID = 'all-MiniLM-L6-v2'
export const LOCAL_MODEL_DIM = 384
export const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small'
export const OPENAI_EMBEDDING_DIM = 256

const LOCAL_MODEL_DIR = path.join(process.cwd(), 'data/models')

let extractorPromise
let cachedStore

function readStore() {
  try {
    if (!fs.existsSync(EMBEDDINGS_PATH)) return null
    const store = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf8'))
    if (!store || typeof store !== 'object' || typeof store.vectors !== 'object') return null
    return store
  } catch (error) {
    console.error(`Could not read the embedding index; using BM25. ${error?.message ?? error}`)
    return null
  }
}

export function loadEmbeddingStore() {
  if (process.env.NODE_ENV === 'production' && cachedStore !== undefined) return cachedStore
  cachedStore = readStore()
  return cachedStore
}

function cosine(a, b) {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

/** Best-first chunk ids for `queryVector`. Ids without a vector are skipped. */
export function rankByEmbedding(queryVector, store, ids) {
  const ranked = []
  for (const id of ids) {
    const vector = store.vectors[id]
    if (!Array.isArray(vector) || vector.length !== queryVector.length) continue
    ranked.push({ id, score: cosine(queryVector, vector) })
  }
  ranked.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1))
  return ranked.map(({ id }) => id)
}

async function localExtractor() {
  extractorPromise ??= (async () => {
    const { pipeline, env } = await import('@huggingface/transformers')
    env.allowLocalModels = true
    env.allowRemoteModels = false
    env.localModelPath = LOCAL_MODEL_DIR
    return pipeline('feature-extraction', LOCAL_MODEL_ID, { dtype: 'q8' })
  })()
  try {
    return await extractorPromise
  } catch (error) {
    extractorPromise = null
    throw error
  }
}

function rowsFromOutput(output, count) {
  const width = output.dims.at(-1)
  const vectors = []
  for (let i = 0; i < count; i++) {
    vectors.push(Array.from(output.data.slice(i * width, (i + 1) * width)))
  }
  return vectors
}

async function embedLocal(texts) {
  const list = Array.isArray(texts) ? texts : [texts]
  const extractor = await localExtractor()
  const output = await extractor(list, { pooling: 'mean', normalize: true })
  const vectors = rowsFromOutput(output, list.length)
  return Array.isArray(texts) ? vectors : vectors[0]
}

function openaiClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null
  // Every option is set so the SDK does not read OPENAI_BASE_URL or send this
  // key to another host. Chat may be using Groq at the same time.
  return new OpenAI({ apiKey, baseURL: 'https://api.openai.com/v1', organization: null, project: null })
}

async function embedOpenAI(texts, store) {
  const client = openaiClient()
  if (!client) return null
  const list = Array.isArray(texts) ? texts : [texts]
  const response = await client.embeddings.create(
    {
      model: store.model || OPENAI_EMBEDDING_MODEL,
      input: list,
      dimensions: store.dimensions || OPENAI_EMBEDDING_DIM
    },
    { signal: AbortSignal.timeout(2500) }
  )
  const vectors = response.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((row) => row.embedding)
  if (vectors.length !== list.length || vectors.some((vector) => !Array.isArray(vector))) {
    throw new Error('The embedding API returned an unexpected payload.')
  }
  return Array.isArray(texts) ? vectors : vectors[0]
}

export async function embedTexts(texts, store) {
  if (!store) return null
  if (store.provider === 'local') return embedLocal(texts)
  if (store.provider === 'openai') return embedOpenAI(texts, store)
  throw new Error(`Unknown embedding provider "${store.provider}".`)
}

export async function embedQuery(text, store) {
  return embedTexts(text, store)
}
