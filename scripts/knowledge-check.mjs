// Shows which knowledge chunks the /ask chat retrieves for a question.
// Usage: bun run knowledge:check -- "What did he build with RAG?"

import { retrieve } from '../src/lib/knowledge.js'

const query = process.argv.slice(2).join(' ').trim()
if (!query) {
  console.error('Usage: bun run knowledge:check -- "your question"')
  process.exit(1)
}

for (const chunk of retrieve(query)) {
  const score = chunk.score === undefined ? 'pinned' : chunk.score.toFixed(2)
  console.log(`${score.padStart(6)}  ${chunk.id}  (${chunk.topic} — ${chunk.heading})`)
}
