// Shows which chunks the /ask chat retrieves for a question.
// Usage: bun run knowledge:check -- "What did he build with RAG?"

import { retrieveDetailed, suggestQuestions } from '../src/lib/knowledge.js'

const query = process.argv.slice(2).join(' ').trim()
if (!query) {
  console.error('Usage: bun run knowledge:check -- "your question"')
  process.exit(1)
}

const { mode, chunks } = await retrieveDetailed(query)
console.error(`retrieval: ${mode}`)
for (const chunk of chunks) {
  // BM25 scores are larger than 1. RRF scores sit near 0.03, so they need more digits.
  const score =
    chunk.score === undefined ? 'pinned' : chunk.score >= 0.1 ? chunk.score.toFixed(2) : chunk.score.toFixed(4)
  console.log(`${score.padStart(8)}  ${chunk.id}  (${chunk.topic} — ${chunk.heading})`)
}
console.log('\nSuggested next:')
for (const question of suggestQuestions(chunks, { asked: [query] })) console.log(`  - ${question}`)
