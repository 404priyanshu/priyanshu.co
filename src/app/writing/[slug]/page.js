import './post.css'

import { ArrowLeft } from 'lucide-react'
import Markdown from 'markdown-to-jsx'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleToc } from '@/components/article-toc'
import { BiasVarianceEquation, BiasVarianceTargets, BiasVarianceTradeoff } from '@/components/bias-variance-visuals'
import { FloatingHeader } from '@/components/floating-header'
import { Pre } from '@/components/mdx/pre'
import { ScrollArea } from '@/components/scroll-area'
import { ScrollProgress } from '@/components/scroll-progress'
import { getAllPostSlugs, getPostBySlug } from '@/lib/markdown'
import { getDateTimeFormat } from '@/lib/utils'

// Posts are markdown files in the repo, so generateStaticParams below already
// enumerates every slug that can exist. Without this, an unknown slug renders
// on demand and the notFound() result gets cached as a prerender, which serves
// the not-found page with a 200 — a soft 404 crawlers will index.
export const dynamicParams = false

export async function generateStaticParams() {
  const allPosts = getAllPostSlugs()
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.title,
    description: post.description || post.title,
    openGraph: {
      title: post.title,
      description: post.description || post.title,
      type: 'article',
      publishedTime: new Date(post.date).toISOString()
    }
  }
}

// Custom H2 component to add click-to-copy anchor links
const CustomH2 = ({ children, ...props }) => {
  const text = Array.isArray(children)
    ? children.map((c) => (typeof c === 'string' ? c : c?.props?.children || '')).join('')
    : typeof children === 'string'
      ? children
      : ''

  const id = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return (
    <h2 {...props} id={id}>
      <a
        href={`#${id}`}
        className="section-link group/heading inline-flex items-center gap-1.5 no-underline hover:no-underline"
      >
        <span>{children}</span>
        <span className="heading-anchor text-sm font-normal text-zinc-400 opacity-0 transition-opacity select-none group-hover/heading:opacity-100">
          #
        </span>
      </a>
    </h2>
  )
}

// Custom H3 component to add click-to-copy anchor links
const CustomH3 = ({ children, ...props }) => {
  const text = Array.isArray(children)
    ? children.map((c) => (typeof c === 'string' ? c : c?.props?.children || '')).join('')
    : typeof children === 'string'
      ? children
      : ''

  const id = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return (
    <h3 {...props} id={id}>
      <a
        href={`#${id}`}
        className="section-link group/heading inline-flex items-center gap-1.5 no-underline hover:no-underline"
      >
        <span>{children}</span>
        <span className="heading-anchor text-sm font-normal text-zinc-400 opacity-0 transition-opacity select-none group-hover/heading:opacity-100">
          #
        </span>
      </a>
    </h3>
  )
}

export default async function WritingSlug({ params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const dateString = getDateTimeFormat(post.date)
  // The page header already renders the title; keep the source Markdown intact.
  const content = post.content.replace(/^\s*# ([^\n]+)\r?\n/, (heading, title) =>
    title.trim() === post.title.trim() ? '' : heading
  )

  // 1. Calculate reading time & word count
  const wordCount = post.content.split(/\s+/).filter(Boolean).length
  const readingTime = Math.ceil(wordCount / 200)

  // 2. Parse H2 headings for dynamic Table of Contents
  const headings = []
  const lines = post.content.split('\n')
  let inCodeBlock = false
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (!inCodeBlock && line.startsWith('## ')) {
      const text = line.replace('## ', '').trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      headings.push({ text, id })
    }
  }

  return (
    <ScrollArea className="animate-reveal min-w-0 bg-white text-zinc-950" useScrollAreaId>
      <ScrollProgress />
      <FloatingHeader scrollTitle={post.title} goBackLink="/writing" backLabel="Writing" />
      <nav
        aria-label="Article navigation"
        className="sticky top-0 z-10 hidden min-h-16 shrink-0 items-center gap-6 border-b border-zinc-200 bg-white px-8 lg:flex"
      >
        <Link
          href="/writing"
          className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to writing
        </Link>
      </nav>
      <div className="content-wrapper lg:pt-12">
        {/* Double-column grid for reading layout & side content */}
        <div className="mx-auto flex max-w-[70rem] items-start justify-center gap-12">
          {/* Left Main Article Content */}
          <div className="w-full max-w-[46rem] min-w-0 flex-1">
            <header className="mb-10">
              <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.7rem] leading-5 tracking-[0.14em] text-zinc-400 uppercase">
                <time dateTime={post.date}>{dateString}</time>
                <span aria-hidden="true" className="text-zinc-200">
                  /
                </span>
                <span>Priyanshu Singh</span>
                <span aria-hidden="true">·</span>
                <span>{readingTime} min read</span>
              </div>
              <h1
                id="writing-post-title"
                className="text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em] text-zinc-900 sm:text-4xl lg:text-5xl"
              >
                {post.title}
              </h1>
              {post.description && (
                <p className="mt-5 mb-0 text-base leading-relaxed font-normal text-zinc-500 md:text-lg">
                  {post.description}
                </p>
              )}
            </header>

            <article className="blog-post" aria-labelledby="writing-post-title">
              <Markdown
                className="blog-content"
                options={{
                  wrapper: 'div',
                  forceWrapper: true,
                  overrides: {
                    BiasVarianceEquation,
                    BiasVarianceTargets,
                    BiasVarianceTradeoff,
                    pre: Pre,
                    h2: CustomH2,
                    h3: CustomH3
                  }
                }}
              >
                {content}
              </Markdown>
            </article>

            {/* Back button at the bottom of post */}
            <div className="mt-16 border-t border-zinc-100 pt-8">
              <Link
                href="/writing"
                className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Back to writing
              </Link>
            </div>
          </div>

          {/* Keep the reading outline alongside the article without a second metadata panel. */}
          {headings.length > 0 && (
            <aside className="sticky top-24 hidden max-h-[calc(100dvh-8rem)] w-56 shrink-0 overflow-y-auto min-[1440px]:block">
              <ArticleToc headings={headings} />
            </aside>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
