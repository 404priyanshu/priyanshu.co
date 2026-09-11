import { ArrowUpRight, Radio } from 'lucide-react'
import Link from 'next/link'

import { FloatingHeader } from '@/components/floating-header'
import { ScrollArea } from '@/components/scroll-area'
import { getAllPosts } from '@/lib/markdown'
import { getDateTimeFormat, getSortedPosts } from '@/lib/utils'

export const metadata = {
  title: 'Writing',
  description: 'My thoughts on software development, tech, and more.'
}

export default async function Writing() {
  const posts = getSortedPosts(await getAllPosts())

  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader title="Writing" />
      <div className="content-wrapper lg:pt-14">
        <div className="content">
          <header className="mb-8 border-b border-zinc-200 pb-8">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-medium tracking-tight">Writing</h1>
              <a
                href="/writing.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 lg:inline-flex"
              >
                <Radio size={14} aria-hidden="true" /> RSS feed
              </a>
            </div>
            <p className="mt-4 mb-0 text-sm text-zinc-500">Things I've learned, written down along the way.</p>
          </header>
          <div>
            {posts.length ? (
              posts.map((post) => (
                <Link
                  key={post.slug}
                  href={'/writing/' + post.slug}
                  className="group mb-2 flex items-start justify-between gap-5 rounded-md px-3 py-5 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <div className="min-w-0">
                    <time dateTime={post.date} className="text-xs text-zinc-500">
                      {getDateTimeFormat(post.date)}
                    </time>
                    <h2 className="mt-2 text-lg font-medium tracking-tight text-zinc-900">{post.title}</h2>
                    {post.description && (
                      <p className="mt-2 mb-0 max-w-[60ch] text-sm leading-relaxed text-zinc-500">{post.description}</p>
                    )}
                  </div>
                  <ArrowUpRight
                    size={17}
                    className="mt-1 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>
              ))
            ) : (
              <p className="text-sm text-zinc-500">New writing is on the way.</p>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
