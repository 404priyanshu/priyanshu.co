import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { BookmarkList } from '@/components/bookmark-list'
import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { getBookmarkItems, getBookmarks } from '@/lib/raindrop'
import { sortByProperty } from '@/lib/utils'

// ADD THIS LINE - tells Next.js to render this page dynamically
export const dynamic = 'force-dynamic'

// REMOVE OR COMMENT OUT generateStaticParams
// export async function generateStaticParams() {
//   const bookmarks = await getBookmarks()
//   return bookmarks.map((bookmark) => ({ slug: bookmark.slug }))
// }

async function fetchData(slug) {
  const bookmarks = await getBookmarks()

  // Add null check
  if (!bookmarks) {
    console.error('Failed to fetch bookmarks')
    notFound()
  }

  const currentBookmark = bookmarks.find((bookmark) => bookmark.slug === slug)
  if (!currentBookmark) notFound()

  const sortedBookmarks = sortByProperty(bookmarks, 'title')
  const bookmarkItems = await getBookmarkItems(currentBookmark._id)

  return {
    bookmarks: sortedBookmarks,
    currentBookmark,
    bookmarkItems
  }
}

export default async function CollectionPage(props) {
  const params = await props.params
  const { slug } = params
  const { bookmarks, currentBookmark, bookmarkItems } = await fetchData(slug)

  return (
    <ScrollArea className="bg-grid" useScrollAreaId>
      <FloatingHeader
        scrollTitle={currentBookmark.title}
        goBackLink="/bookmarks"
        bookmarks={bookmarks}
        currentBookmark={currentBookmark}
      />
      <div className="content-wrapper">
        <div className="content @container">
          <PageTitle title={currentBookmark.title} />
          <Suspense fallback={<ScreenLoadingSpinner />}>
            <BookmarkList id={currentBookmark._id} initialData={bookmarkItems} />
          </Suspense>
        </div>
      </div>
    </ScrollArea>
  )
}

export async function generateMetadata(props) {
  const params = await props.params
  const { slug } = params
  const bookmarks = await getBookmarks()

  // Add null check
  if (!bookmarks) {
    return {
      title: 'Bookmarks',
      description: 'Curated bookmarks collection'
    }
  }

  const currentBookmark = bookmarks.find((bookmark) => bookmark.slug === slug)
  if (!currentBookmark) return null

  const siteUrl = `/bookmarks/${currentBookmark.slug}`
  const seoTitle = `${currentBookmark.title} | Bookmarks`
  const seoDescription = `A curated selection of various handpicked ${currentBookmark.title.toLowerCase()} bookmarks by Priyanshu Singh`

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      currentBookmark.title,
      'bookmarks',
      `${currentBookmark.title} bookmarks`,
      'collection',
      `${currentBookmark.title} collection`
    ],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: siteUrl,
      images: siteUrl + '/og.png'
    },
    alternates: {
      canonical: siteUrl
    }
  }
}
