// Retrieval eval for the /ask chat. Compares BM25 with hybrid BM25 + embeddings.
//
//   bun run knowledge:eval
//   bun run knowledge:eval -- --verbose
//
// Questions and the chunk ids that answer them live in evals/ask-retrieval.json.
// Hybrid uses the committed index and embeds each question the same way the
// route does. If that index is missing or stale, the script still prints BM25
// and exits non-zero.

import fs from 'node:fs'
import path from 'node:path'

import { embedTexts, loadEmbeddingStore, rankByEmbedding } from '../src/lib/embeddings.js'
import { fuseRankings, getIndex, rankBm25 } from '../src/lib/knowledge.js'

const verbose = process.argv.includes('--verbose')
const evalPath = path.join(process.cwd(), 'evals/ask-retrieval.json')
const labelled = JSON.parse(fs.readFileSync(evalPath, 'utf8'))
const questions = labelled.questions
const ks = labelled.k ?? [4, 8]

if (!Array.isArray(questions) || questions.length === 0) {
  console.error('The eval file has no questions.')
  process.exit(1)
}

const index = getIndex()
const known = new Set(index.chunks.map((chunk) => chunk.id))
const pinned = new Set(index.chunks.filter((chunk) => chunk.pinned).map((chunk) => chunk.id))
let labelsOk = true
for (const row of questions) {
  if (!row.question || !Array.isArray(row.relevant) || row.relevant.length === 0) {
    console.error(`Bad eval row: ${JSON.stringify(row)}`)
    labelsOk = false
    continue
  }
  for (const id of row.relevant) {
    if (!known.has(id)) {
      console.error(`Unknown chunk id "${id}" for: ${row.question}`)
      labelsOk = false
    }
    if (pinned.has(id)) {
      console.error(`"${id}" is pinned, so it is not a retrieval hit: ${row.question}`)
      labelsOk = false
    }
  }
}
if (!labelsOk) process.exit(1)

function recallAt(ids, relevant, k) {
  const top = new Set(ids.slice(0, k))
  return relevant.filter((id) => top.has(id)).length / relevant.length
}

function reciprocalRank(ids, relevant) {
  const wanted = new Set(relevant)
  const rank = ids.findIndex((id) => wanted.has(id))
  return rank === -1 ? 0 : 1 / (rank + 1)
}

function average(rows, pick) {
  return rows.reduce((sum, row, index) => sum + pick(row, index), 0) / rows.length
}

const bm25Rankings = questions.map((row) => rankBm25(row.question).map(({ chunk }) => chunk.id))

const store = loadEmbeddingStore()
const storeOk = store?.corpusHash === index.corpusHash && store.vectors && store.dimensions
let hybridRankings = null
if (!storeOk) {
  console.error(
    store
      ? 'Embedding index is missing or stale. Run `bun run knowledge:embed`. Hybrid numbers were not computed.'
      : 'No embedding index at data/ask-embeddings.json. Run `bun run knowledge:embed`. Hybrid numbers were not computed.'
  )
} else {
  try {
    const vectors = await embedTexts(
      questions.map((row) => row.question),
      store
    )
    if (!vectors || vectors.some((vector) => vector.length !== store.dimensions)) {
      throw new Error('Query embeddings did not match the index.')
    }
    const denseIds = index.chunks.filter((chunk) => !chunk.pinned).map((chunk) => chunk.id)
    hybridRankings = vectors.map((vector, i) =>
      fuseRankings(bm25Rankings[i], rankByEmbedding(vector, store, denseIds)).map(({ id }) => id)
    )
  } catch (error) {
    console.error(`Hybrid eval failed (${error?.message ?? error}). BM25 numbers are below.`)
  }
}

function summarize(name, rankings) {
  const recalls = ks.map((k) => average(questions, (row, i) => recallAt(rankings[i], row.relevant, k)))
  const mrr = average(questions, (row, i) => reciprocalRank(rankings[i], row.relevant))
  return { name, recalls, mrr }
}

const reports = [summarize('bm25', bm25Rankings)]
if (hybridRankings) reports.push(summarize('hybrid', hybridRankings))

const header = ['method', ...ks.map((k) => `recall@${k}`), 'MRR'].join('\t')
console.log(`Questions: ${questions.length}. Pinned chunks are excluded; they ship with every answer.`)
console.log('Hybrid fuses the top 20 BM25 hits with the top 20 embedding hits (RRF, k=60).')
console.log(header)
for (const report of reports) {
  const cells = [report.name.padEnd(8), ...report.recalls.map((value) => value.toFixed(3)), report.mrr.toFixed(3)]
  console.log(cells.join('\t'))
}

if (verbose || hybridRankings) {
  console.log('\nPer question (first relevant rank, 1-based; a blank means it was not ranked):')
  questions.forEach((row, i) => {
    const ranks = [bm25Rankings, hybridRankings].filter(Boolean).map((rankings) => {
      const rank = rankings[i].findIndex((id) => row.relevant.includes(id))
      return rank === -1 ? '-' : String(rank + 1)
    })
    console.log(`${ranks.map((rank) => rank.padStart(4)).join(' ')}  ${row.question}`)
  })
}

if (!hybridRankings) process.exit(1)
