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
            className="flex flex-col gap-1 border-b px-4 py-3 text-sm hover:bg-gray-100"
          >
            <span className="font-medium">{post.title}</span>
            <span className="text-slate-500">
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
