import Link from 'next/link'
import { Suspense } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { getBookmarks } from '@/lib/raindrop'
import { sortByProperty } from '@/lib/utils'

export const metadata = {
  title: 'Bookmarks',
  description: 'My curated collection of useful links and resources.'
}

// ADD THIS LINE
export const dynamic = 'force-dynamic'

async function fetchData() {
  const bookmarks = await getBookmarks()

  // Add null check
  if (!bookmarks) {
    return { bookmarks: [] }
  }

  const sortedBookmarks = sortByProperty(bookmarks, 'title')
  return { bookmarks: sortedBookmarks }
}

export default async function BookmarksPage() {
  const { bookmarks } = await fetchData()

  return (
    <ScrollArea className="lg:hidden">
      <FloatingHeader title="Bookmarks" />
      <Suspense fallback={<ScreenLoadingSpinner />}>
        {bookmarks?.map((bookmark) => {
          return (
            <Link
              key={bookmark._id}
              href={`/bookmarks/${bookmark.slug}`}
              className="flex flex-col gap-1 border-b px-4 py-3 text-sm hover:bg-gray-100"
            >
              <span className="font-medium">{bookmark.title}</span>
              <span className="text-slate-500">{bookmark.count} bookmarks</span>
            </Link>
          )
        })}
      </Suspense>
    </ScrollArea>
  )
}
