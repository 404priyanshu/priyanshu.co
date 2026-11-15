// Shows which knowledge chunks the /ask chat retrieves for a question.
// Usage: bun run knowledge:check -- "What did he build with RAG?"

import { retrieve, suggestQuestions } from '../src/lib/knowledge.js'

const query = process.argv.slice(2).join(' ').trim()
if (!query) {
  console.error('Usage: bun run knowledge:check -- "your question"')
  process.exit(1)
}

const chunks = retrieve(query)
for (const chunk of chunks) {
  const score = chunk.score === undefined ? 'pinned' : chunk.score.toFixed(2)
  console.log(`${score.padStart(6)}  ${chunk.id}  (${chunk.topic} — ${chunk.heading})`)
}
console.log('\nSuggested next:')
for (const question of suggestQuestions(chunks, { asked: [query] })) console.log(`  - ${question}`)
