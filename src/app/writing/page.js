import { ArrowRight, Radio } from 'lucide-react'
import Link from 'next/link'

import { FloatingHeader } from '@/components/floating-header'
import { ScrollArea } from '@/components/scroll-area'
import { getAllPosts } from '@/lib/markdown'
import { getSortedPosts } from '@/lib/utils'

export const metadata = {
  title: 'Writing',
  description: 'Notes on software, the web, and things learned by building.'
}

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' })

export default async function Writing() {
  const posts = getSortedPosts(await getAllPosts())
  const years = [...new Set(posts.map((post) => post.date.slice(0, 4)))]

  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader title="Writing" />
      <div className="content-wrapper lg:pt-14">
        <div className="mx-auto w-full max-w-[880px]">
          <header className="border-b border-zinc-200 pb-7">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Writing</h1>
              <a
                href="/writing.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 lg:inline-flex"
              >
                <Radio size={14} aria-hidden="true" /> RSS feed
              </a>
            </div>
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-zinc-500">
              Notes on software, the web, and things learned by building.
            </p>
          </header>

          <div className="flex items-center justify-between pt-6 pb-2 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
            <span>
              All articles <span className="ml-2 text-zinc-400">{String(posts.length).padStart(2, '0')}</span>
            </span>
            <span>Newest first</span>
          </div>

          {years.map((year) => (
            <section
              key={year}
              aria-labelledby={`year-${year}`}
              className="mt-6 grid gap-2 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-6"
            >
              <h2 id={`year-${year}`} className="pt-4 font-mono text-xs font-medium text-zinc-500">
                {year}
              </h2>
              <ol className="divide-y divide-zinc-200 border-t border-zinc-200">
                {posts
                  .filter((post) => post.date.startsWith(year))
                  .map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={'/writing/' + post.slug}
                        className="group -mx-3 grid grid-cols-[1fr_auto] items-start gap-x-4 rounded-sm px-3 py-5 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 sm:grid-cols-[52px_minmax(0,1fr)_16px]"
                      >
                        <time
                          dateTime={post.date}
                          className="col-span-2 mb-2 pt-0.5 font-mono text-[11px] whitespace-nowrap text-zinc-500 sm:col-span-1 sm:mb-0"
                        >
                          {shortDate.format(new Date(post.date))}
                        </time>
                        <div className="min-w-0">
                          <h3 className="text-[15px] leading-snug font-medium tracking-tight text-zinc-900 sm:text-base">
                            {post.title}
                          </h3>
                          {post.description && (
                            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-zinc-500">
                              {post.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight
                          size={15}
                          className="mt-1 text-zinc-400 group-hover:text-zinc-900"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
              </ol>
            </section>
          ))}
          {!posts.length && <p className="py-8 text-sm text-zinc-500">New writing is on the way.</p>}
          <footer className="mt-10 border-t border-zinc-200 pt-5 pb-8 text-xs leading-relaxed text-zinc-500">
            Occasional notes, as I find something worth sharing.{' '}
            <a
              href="/writing.xml"
              className="text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-700"
            >
              Follow via RSS
            </a>
            .
          </footer>
        </div>
      </div>
    </ScrollArea>
  )
}
