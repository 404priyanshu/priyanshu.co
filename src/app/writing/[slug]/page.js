import './post.css'

import { ArrowLeft, Clock, FileText } from 'lucide-react'
import Markdown from 'markdown-to-jsx'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FloatingHeader } from '@/components/floating-header'
import { Pre } from '@/components/mdx/pre'
import { ScrollArea } from '@/components/scroll-area'
import { ScrollProgress } from '@/components/scroll-progress'
import { getAllPostSlugs, getPostBySlug } from '@/lib/markdown'
import { getDateTimeFormat } from '@/lib/utils'

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
    ? children.map(c => typeof c === 'string' ? c : c?.props?.children || '').join('')
    : (typeof children === 'string' ? children : '')
  
  const id = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return (
    <h2 id={id} {...props}>
      <a href={`#${id}`} className="group/heading inline-flex items-center gap-1.5 no-underline hover:no-underline">
        <span>{children}</span>
        <span className="heading-anchor select-none text-zinc-400 opacity-0 group-hover/heading:opacity-100 transition-opacity font-normal text-sm">
          #
        </span>
      </a>
    </h2>
  )
}

// Custom H3 component to add click-to-copy anchor links
const CustomH3 = ({ children, ...props }) => {
  const text = Array.isArray(children)
    ? children.map(c => typeof c === 'string' ? c : c?.props?.children || '').join('')
    : (typeof children === 'string' ? children : '')
  
  const id = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return (
    <h3 id={id} {...props}>
      <a href={`#${id}`} className="group/heading inline-flex items-center gap-1.5 no-underline hover:no-underline">
        <span>{children}</span>
        <span className="heading-anchor select-none text-zinc-400 opacity-0 group-hover/heading:opacity-100 transition-opacity font-normal text-sm">
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
    <ScrollArea className="bg-white text-zinc-950 animate-reveal" useScrollAreaId>
      <ScrollProgress />
      <FloatingHeader scrollTitle={post.title} goBackLink="/writing" />
      <div className="content-wrapper lg:pt-20">
        {/* Double-column grid for reading layout & side content */}
        <div className="mx-auto flex max-w-[70rem] gap-12 items-start justify-center">
          
          {/* Left Main Article Content */}
          <div className="w-full max-w-[46rem] shrink-0">
            <header className="mb-8 border-b border-zinc-100 pb-6">
              {/* Quick minimalist desktop breadcrumbs and website page links */}
              <div className="mb-8 hidden lg:flex items-center justify-between select-none">
                <Link 
                  href="/writing" 
                  className="group inline-flex items-center gap-1.5 text-xs font-mono font-semibold tracking-widest text-zinc-400 hover:text-zinc-950 uppercase transition-colors"
                >
                  <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                  Writing
                </Link>
                <nav className="flex items-center gap-4 text-xs font-medium text-zinc-400">
                  <Link href="/" className="hover:text-zinc-950 transition-colors">Home</Link>
                  <span className="text-zinc-200">/</span>
                  <Link href="/journey" className="hover:text-zinc-950 transition-colors">Journey</Link>
                  <span className="text-zinc-200">/</span>
                  <Link href="/stack" className="hover:text-zinc-950 transition-colors">Stack</Link>
                  <span className="text-zinc-200">/</span>
                  <Link href="/workspace" className="hover:text-zinc-950 transition-colors">Workspace</Link>
                  <span className="text-zinc-200">/</span>
                  <Link href="/bookmarks" className="hover:text-zinc-950 transition-colors">Bookmarks</Link>
                </nav>
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.7rem] leading-5 tracking-[0.14em] text-zinc-400 uppercase">
                <time dateTime={post.date}>{dateString}</time>
                <span aria-hidden="true" className="text-zinc-200">
                  /
                </span>
                <span>Priyanshu Singh</span>
              </div>
              <h1
                id="writing-post-title"
                className="text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em] text-zinc-900 sm:text-4xl lg:text-5xl"
              >
                {post.title}
              </h1>
              {post.description && (
                <p className="mt-6 text-base md:text-lg leading-relaxed text-zinc-500 font-normal">
                  {post.description}
                </p>
              )}
            </header>

            <article className="blog-post" aria-labelledby="writing-post-title">
              <Markdown
                options={{
                  overrides: {
                    pre: Pre,
                    h2: CustomH2,
                    h3: CustomH3
                  }
                }}
              >
                {post.content}
              </Markdown>
            </article>

            {/* Back button at the bottom of post */}
            <div className="mt-16 border-t border-zinc-100 pt-8">
              <Link 
                href="/writing" 
                className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to writing
              </Link>
            </div>
          </div>

          {/* Right Sticky Sidebar (Desktop only) */}
          <aside className="sticky top-28 hidden xl:block w-56 shrink-0 space-y-8 select-none">
            
            {/* Dynamic Metadata details */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest block">
                  Metadata
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-600">
                    <Clock size={14} className="text-zinc-400" />
                    <span>{readingTime} min read</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-600">
                    <FileText size={14} className="text-zinc-400" />
                    <span>{wordCount.toLocaleString()} words</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Table of Contents */}
            {headings.length > 0 && (
              <div className="space-y-3 pl-1">
                <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest block">
                  On this page
                </span>
                <nav className="space-y-2.5 border-l border-zinc-100 pl-3 text-[13px] leading-normal">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className="block font-medium text-zinc-400 hover:text-zinc-950 transition-colors py-0.5"
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </aside>

        </div>
      </div>
    </ScrollArea>
  )
}
