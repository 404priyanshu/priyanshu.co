// Precompute document embeddings for the /ask hybrid retriever.
//
//   bun run knowledge:embed
//   EMBEDDING_PROVIDER=openai bun run knowledge:embed
//
// The default writes vectors from the vendored all-MiniLM-L6-v2 model.
// `openai` calls text-embedding-3-small (256 dimensions) and needs OPENAI_API_KEY.
// Query embedding at request time must use the same provider and model, so the
// file records both. Re-run this after editing content/knowledge or content/writing.

import fs from 'node:fs'
import path from 'node:path'

import {
  EMBEDDINGS_PATH,
  embedTexts,
  LOCAL_MODEL_DIM,
  LOCAL_MODEL_ID,
  OPENAI_EMBEDDING_DIM,
  OPENAI_EMBEDDING_MODEL
} from '../src/lib/embeddings.js'
import { corpusHash, embeddingDocument, loadChunks } from '../src/lib/knowledge.js'

const provider = (process.env.EMBEDDING_PROVIDER || 'local').toLowerCase()

const providers = {
  local: { provider: 'local', model: LOCAL_MODEL_ID, dimensions: LOCAL_MODEL_DIM },
  openai: { provider: 'openai', model: OPENAI_EMBEDDING_MODEL, dimensions: OPENAI_EMBEDDING_DIM }
}

const spec = providers[provider]
if (!spec) {
  console.error(`Unknown EMBEDDING_PROVIDER "${provider}". Use "local" or "openai".`)
  process.exit(1)
}
if (provider === 'openai' && !process.env.OPENAI_API_KEY?.trim()) {
  console.error('OPENAI_API_KEY is not set. BM25 does not need it; this script does when provider is openai.')
  process.exit(1)
}

const chunks = loadChunks()
const documents = chunks.map(embeddingDocument)
const store = { ...spec, corpusHash: corpusHash(chunks), vectors: {} }

const batchSize = provider === 'openai' ? 64 : 32
for (let start = 0; start < documents.length; start += batchSize) {
  const batch = documents.slice(start, start + batchSize)
  const vectors = await embedTexts(batch, store)
  if (!vectors) {
    console.error('The embedding API returned nothing. Check OPENAI_API_KEY.')
    process.exit(1)
  }
  vectors.forEach((vector, index) => {
    if (vector.length !== spec.dimensions) {
      console.error(`Expected ${spec.dimensions} dimensions, got ${vector.length}.`)
      process.exit(1)
    }
    store.vectors[chunks[start + index].id] = vector.map((value) => Number(value.toFixed(6)))
  })
  console.error(`Embedded ${Math.min(start + batchSize, documents.length)}/${documents.length}`)
}

fs.mkdirSync(path.dirname(EMBEDDINGS_PATH), { recursive: true })
fs.writeFileSync(EMBEDDINGS_PATH, `${JSON.stringify(store)}\n`)
console.error(`Wrote ${Object.keys(store.vectors).length} vectors to ${path.relative(process.cwd(), EMBEDDINGS_PATH)}`)
