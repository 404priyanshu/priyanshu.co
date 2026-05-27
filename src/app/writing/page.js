import Link from 'next/link'
import { Suspense } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { getAllPosts } from '@/lib/markdown'

export const metadata = {
  title: 'Writing',
  description: 'My thoughts on software development, tech, and more.'
}

async function fetchData() {
  const allPosts = getAllPosts()
  return { allPosts }
}

export default async function Writing() {
  const { allPosts } = await fetchData()

  return (
    <ScrollArea className="lg:hidden">
      <FloatingHeader title="Writing" />
      <Suspense fallback={<ScreenLoadingSpinner />}>
        {allPosts?.map((post) => (
          <Link
            key={post.slug}
            href={`/writing/${post.slug}`}
            className="flex flex-col gap-2 border-b border-zinc-200 px-5 py-4 text-sm transition-colors hover:bg-zinc-50"
          >
            <span className="font-sans text-[0.95rem] leading-snug font-medium tracking-tight text-zinc-950">
              {post.title}
            </span>
            <span className="font-mono text-[0.68rem] tracking-[0.08em] text-zinc-500 uppercase">
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </Link>
        ))}
      </Suspense>
    </ScrollArea>
  )
}
