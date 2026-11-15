'use client'

import { ArrowUpIcon, RotateCcwIcon, SquareIcon } from 'lucide-react'
import Markdown from 'markdown-to-jsx'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CONTACT_EMAIL, SCROLL_AREA_ID } from '@/lib/constants'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'What is Priyanshu working on right now?',
  'Which RAG projects has he built?',
  'What is his tech stack?',
  'How can I contact him?'
]

// Keep in step with the limits in src/app/api/chat/route.js.
const MAX_HISTORY = 12
const MAX_QUESTION_CHARS = 1000
// Follow the stream only while the reader is this close to the bottom.
const STICK_THRESHOLD_PX = 120

// Some models (gpt-oss on Groq) add citation markers such as 【3†L1-L4】 even
// when told not to. The page lists sources itself, so drop them, including a
// half-streamed one at the end of the text.
const stripCitations = (text) => text.replace(/\s*【[^】]*】/g, '').replace(/\s*【[^】]*$/, '')

let nextId = 0
const createId = () => `m${++nextId}`

function SafeLink({ href = '', children }) {
  // Answers are model output: only plain web and mail links become clickable.
  if (!/^(https?:|mailto:)/i.test(href)) return <span>{children}</span>
  const external = href.startsWith('http')
  return (
    <a href={href} className="link" {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
      {children}
    </a>
  )
}

const MARKDOWN_OPTIONS = {
  disableParsingRawHTML: true,
  forceBlock: true,
  overrides: {
    a: { component: SafeLink },
    p: { props: { className: 'm-0' } },
    ul: { props: { className: 'my-0 list-disc space-y-1 pl-5' } },
    ol: { props: { className: 'my-0 list-decimal space-y-1 pl-5' } },
    // The model is told not to use headings; if it does, keep them at body size.
    h1: { component: 'p', props: { className: 'm-0 font-semibold' } },
    h2: { component: 'p', props: { className: 'm-0 font-semibold' } },
    h3: { component: 'p', props: { className: 'm-0 font-semibold' } }
  }
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1.5" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 rounded-full bg-zinc-400 motion-safe:animate-pulse"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

function Message({ message, isStreaming }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="m-0 max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-3.5 py-2 text-[13.5px] leading-relaxed whitespace-pre-wrap text-white">
          {message.content}
        </p>
      </div>
    )
  }

  const waiting = isStreaming && !message.content
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          'max-w-[95%] space-y-3 rounded-2xl rounded-bl-md border bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-zinc-800 shadow-xs',
          message.error && 'border-red-200 bg-red-50 text-red-700'
        )}
      >
        {waiting ? (
          <TypingDots />
        ) : message.error ? (
          <p className="m-0">{message.error}</p>
        ) : (
          <Markdown options={MARKDOWN_OPTIONS}>{stripCitations(message.content)}</Markdown>
        )}
      </div>
      {!isStreaming && message.sources?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pl-1">
          <span className="text-[11px] text-zinc-400">Sources:</span>
          {message.sources.map((source) => (
            <span
              key={source.id}
              title={`${source.topic} — ${source.heading}`}
              className="max-w-56 truncate rounded-full border bg-white px-2 py-0.5 text-[11px] text-zinc-500"
            >
              {source.topic}: {source.heading}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function QuestionChips({ label, questions, onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect(question)}
            className="rounded-full border bg-white px-3 py-1.5 text-left text-[12.5px] text-zinc-700 shadow-xs transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:ring-1 focus-visible:ring-zinc-900"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}

// The route sends sources and next questions as URL-encoded JSON headers.
// Both are extras: a bad header just means the answer shows without them.
function readJsonHeader(response, name) {
  try {
    const value = JSON.parse(decodeURIComponent(response.headers.get(name) ?? '[]'))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function AskChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streamingId, setStreamingId] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const abortRef = useRef(null)
  const inputRef = useRef(null)
  const stickToBottom = useRef(true)

  const isStreaming = streamingId !== null

  useEffect(() => {
    const scrollArea = document.getElementById(SCROLL_AREA_ID)
    if (!scrollArea) return
    const onScroll = () => {
      const distance = scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight
      stickToBottom.current = distance < STICK_THRESHOLD_PX
    }
    scrollArea.addEventListener('scroll', onScroll, { passive: true })
    return () => scrollArea.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (messages.length === 0 || !stickToBottom.current) return
    // Scroll the page itself: the input bar is sticky, so scrolling it into view moves nothing.
    const scrollArea = document.getElementById(SCROLL_AREA_ID)
    scrollArea?.scrollTo({ top: scrollArea.scrollHeight })
    // streamingId too: the next-question chips appear when an answer ends.
  }, [messages, streamingId])

  useEffect(() => () => abortRef.current?.abort(), [])

  const updateMessage = useCallback((id, update) => {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, ...update(message) } : message))
    )
  }, [])

  const send = useCallback(
    async (text) => {
      const question = text.trim()
      if (!question || isStreaming) return

      const userMessage = { id: createId(), role: 'user', content: question }
      const assistantId = createId()
      // Failed or empty answers are not sent back: the API needs real turns.
      const history = [...messages, userMessage]
        .filter((message) => !message.error && message.content)
        // Markers go back without citations, so the model does not copy them.
        .map(({ role, content }) => ({ role, content: role === 'assistant' ? stripCitations(content) : content }))
        .slice(-MAX_HISTORY)
      while (history[0]?.role !== 'user') history.shift()

      setMessages((current) => [...current, userMessage, { id: assistantId, role: 'assistant', content: '' }])
      setInput('')
      setStreamingId(assistantId)
      setAnnouncement('')
      stickToBottom.current = true

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error ?? 'Something went wrong. Please try again.')
        }

        updateMessage(assistantId, () => ({
          sources: readJsonHeader(response, 'X-Chat-Sources'),
          suggestions: readJsonHeader(response, 'X-Chat-Suggestions').filter((item) => typeof item === 'string')
        }))

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          updateMessage(assistantId, (message) => ({ content: message.content + chunk }))
        }
        setAnnouncement('Answer ready.')
      } catch (error) {
        if (error.name === 'AbortError') {
          updateMessage(assistantId, (message) => (message.content ? {} : { error: 'Stopped.' }))
        } else {
          updateMessage(assistantId, () => ({
            error: error.message || `Something went wrong. Please try again, or email ${CONTACT_EMAIL}.`
          }))
          setAnnouncement('The answer failed.')
        }
      } finally {
        abortRef.current = null
        setStreamingId(null)
        inputRef.current?.focus()
      }
    },
    [isStreaming, messages, updateMessage]
  )

  const onSubmit = (event) => {
    event.preventDefault()
    send(input)
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send(input)
    }
  }

  const reset = () => {
    abortRef.current?.abort()
    setMessages([])
    setAnnouncement('')
    inputRef.current?.focus()
  }

  // Next questions show only under the newest answer, once it has finished.
  const lastMessage = messages.at(-1)
  const followUps =
    !isStreaming && lastMessage?.role === 'assistant' && !lastMessage.error ? (lastMessage.suggestions ?? []) : []

  return (
    <div className="mt-6 flex flex-col gap-6">
      {messages.length === 0 ? (
        <QuestionChips label="Try one of these" questions={SUGGESTIONS} onSelect={send} />
      ) : (
        <div className="flex flex-col gap-5" aria-label="Conversation" aria-busy={isStreaming}>
          {messages.map((message) => (
            <Message key={message.id} message={message} isStreaming={message.id === streamingId} />
          ))}
          {followUps.length > 0 && <QuestionChips label="Ask next" questions={followUps} onSelect={send} />}
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <div className="bg-canvas sticky bottom-0 -mx-1 flex flex-col gap-2 px-1 pt-2 pb-1">
        <form
          onSubmit={onSubmit}
          className="flex items-end gap-2 rounded-2xl border bg-white p-2 shadow-xs transition-colors focus-within:border-zinc-400"
        >
          <label htmlFor="ask-input" className="sr-only">
            Your question
          </label>
          <textarea
            id="ask-input"
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={MAX_QUESTION_CHARS}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about Priyanshu…"
            className="field-sizing-content max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-[14px] leading-snug text-zinc-900 outline-hidden placeholder:text-zinc-400"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              title="Stop"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors hover:bg-zinc-700"
            >
              <SquareIcon size={14} fill="currentColor" />
              <span className="sr-only">Stop the answer</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              title="Send"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors hover:bg-zinc-700 disabled:bg-zinc-300"
            >
              <ArrowUpIcon size={16} />
              <span className="sr-only">Send</span>
            </button>
          )}
        </form>
        <div className="flex items-center justify-between gap-3 px-1 text-[11px] text-zinc-400">
          <span>AI answers can be wrong. For anything important, email {CONTACT_EMAIL}.</span>
          {messages.length > 0 && !isStreaming && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex shrink-0 items-center gap-1 transition-colors hover:text-zinc-700"
            >
              <RotateCcwIcon size={11} />
              New chat
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
