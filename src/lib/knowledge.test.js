import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { embedQuery } from './embeddings.js'
import {
  getIndex,
  rankBm25,
  reciprocalRankFusion,
  retrieveBm25,
  retrieveDetailed,
  splitSections,
  suggestQuestions
} from './knowledge.js'

const savedKey = process.env.OPENAI_API_KEY

afterEach(() => {
  if (savedKey === undefined) delete process.env.OPENAI_API_KEY
  else process.env.OPENAI_API_KEY = savedKey
})

function openaiStore() {
  return {
    provider: 'openai',
    model: 'text-embedding-3-small',
    dimensions: 256,
    corpusHash: getIndex().corpusHash,
    vectors: {}
  }
}

describe('corpus', () => {
  it('keeps resume sections and adds a chunk per blog heading', () => {
    const { chunks } = getIndex()
    const knowledge = chunks.filter((chunk) => chunk.source === 'knowledge')
    const writing = chunks.filter((chunk) => chunk.source === 'writing')
    assert.ok(knowledge.length >= 15)
    assert.ok(writing.length > knowledge.length)
    assert.equal(
      chunks.some((chunk) => chunk.id === 'writing/resume-rag-without-a-vector-database#education'),
      false
    )
    const quoted = chunks.find(
      (chunk) => chunk.id === 'writing/resume-rag-without-a-vector-database#the-knowledge-base-is-just-markdown'
    )
    assert.ok(quoted)
    assert.match(quoted.text, /## Education/)
    for (const chunk of writing) {
      assert.match(chunk.href, /^\/writing\/[a-z0-9-]+$/)
      assert.equal(chunk.url, `https://priyanshu.co${chunk.href}`)
    }
  })

  it('still pins the profile summary and finds education for the canonical question', () => {
    const chunks = retrieveBm25('Where did he study?')
    assert.equal(chunks[0].id, 'profile#summary')
    assert.equal(chunks[0].pinned, true)
    assert.ok(chunks.some((chunk) => chunk.id === 'education#education'))
    assert.ok(suggestQuestions(chunks, { asked: ['Where did he study?'] }).length > 0)
  })
})

describe('section splitting', () => {
  it('keeps a shorter fence from closing a longer one', () => {
    const { sections } = splitSections(
      ['## Real', '````md', '## Not a heading', '```', 'still in the fence', '````', '## After'].join('\n')
    )
    assert.deepEqual(
      sections.map((section) => section.heading),
      ['Real', 'After']
    )
    assert.match(sections[0].body, /## Not a heading/)
    assert.match(sections[0].body, /still in the fence/)
  })
})

describe('reciprocal rank fusion', () => {
  it('prefers a chunk that both lists rank highly', () => {
    const fused = reciprocalRankFusion([
      ['a', 'b', 'c'],
      ['b', 'c', 'a']
    ])
    assert.deepEqual(
      fused.map((row) => row.id),
      ['b', 'a', 'c']
    )
  })

  it('keeps a chunk that only one list retrieved', () => {
    const fused = reciprocalRankFusion([['lexical-only'], ['semantic-only']])
    assert.equal(fused.length, 2)
    assert.ok(fused.every((row) => row.score > 0))
  })
})

describe('BM25 fallback', () => {
  const question = 'Where did he study?'

  it('matches BM25 when the embedding index is missing', async () => {
    const result = await retrieveDetailed(question, { embeddings: null })
    assert.equal(result.mode, 'bm25')
    assert.deepEqual(result.chunks, retrieveBm25(question))
  })

  it('matches BM25 when the index hash is stale', async () => {
    const result = await retrieveDetailed(question, { embeddings: { ...openaiStore(), corpusHash: 'stale' } })
    assert.equal(result.mode, 'bm25')
    assert.deepEqual(result.chunks, retrieveBm25(question))
  })

  it('matches BM25 when the embedder throws', async () => {
    const result = await retrieveDetailed(question, {
      embeddings: openaiStore(),
      embedQuery: async () => {
        throw new Error('connection refused')
      }
    })
    assert.equal(result.mode, 'bm25')
    assert.deepEqual(result.chunks, retrieveBm25(question))
  })

  it('matches BM25 when the embedder returns nothing or the wrong width', async () => {
    const missing = await retrieveDetailed(question, {
      embeddings: openaiStore(),
      embedQuery: async () => null
    })
    const wrongWidth = await retrieveDetailed(question, {
      embeddings: openaiStore(),
      embedQuery: async () => [1, 0]
    })
    assert.equal(missing.mode, 'bm25')
    assert.equal(wrongWidth.mode, 'bm25')
    assert.deepEqual(missing.chunks, retrieveBm25(question))
    assert.deepEqual(wrongWidth.chunks, retrieveBm25(question))
  })

  it('uses BM25 when the OpenAI key is missing', async () => {
    delete process.env.OPENAI_API_KEY
    const store = openaiStore()
    assert.equal(await embedQuery('Where did he study?', store), null)
    const result = await retrieveDetailed(question, { embeddings: store })
    assert.equal(result.mode, 'bm25')
    assert.deepEqual(result.chunks, retrieveBm25(question))
  })

  it('uses BM25 when the embedding call fails', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-not-a-real-key'
    const original = global.fetch
    global.fetch = async () => {
      throw new Error('socket hang up')
    }
    try {
      const result = await retrieveDetailed(question, { embeddings: openaiStore() })
      assert.equal(result.mode, 'bm25')
      assert.deepEqual(result.chunks, retrieveBm25(question))
    } finally {
      global.fetch = original
    }
  })

  it('fuses a successful query vector instead of returning the BM25 cutoff', async () => {
    const store = {
      provider: 'local',
      model: 'test',
      dimensions: 2,
      corpusHash: getIndex().corpusHash,
      vectors: {}
    }
    // One vector, aimed at the second BM25 hit. That chunk then has both a
    // keyword vote and the only embedding vote, so it outranks the BM25 #1,
    // which has no vector.
    const lexical = rankBm25(question).map(({ chunk }) => chunk.id)
    assert.ok(lexical.length > 1)
    const target = lexical[1]
    store.vectors[target] = [1, 0]
    const result = await retrieveDetailed(question, {
      embeddings: store,
      embedQuery: async () => [1, 0]
    })
    assert.equal(result.mode, 'hybrid')
    assert.equal(result.chunks[0].pinned, true)
    assert.equal(result.chunks.find((chunk) => !chunk.pinned).id, target)
  })
})
