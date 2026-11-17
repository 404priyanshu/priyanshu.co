import { Suspense } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { HomeClosing, HomeIntroduction, HomeSkills, SectionHeading, SectionLink } from '@/components/home-introduction'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { WritingList } from '@/components/writing-list'
import { getAllPosts } from '@/lib/markdown'
import { getItemsByYear, getSortedPosts } from '@/lib/utils'

// The home page lists only the latest posts; "All posts" links to the rest.
const LATEST_POST_COUNT = 5

async function fetchData() {
  // Only the fields the list renders: passing whole posts to a client component
  // would serialize every article's Markdown into the page.
  const allPosts = (await getAllPosts()).map(({ slug, title, date, sys }) => ({ slug, title, date, sys }))
  // The newest post gets a hand-drawn "New" badge.
  const latestPosts = getSortedPosts(allPosts)
    .slice(0, LATEST_POST_COUNT)
    .map((post, index) => ({ ...post, isNew: index === 0 }))
  const items = getItemsByYear(latestPosts)
  return { items }
}

export default async function Home() {
  const { items } = await fetchData()

  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Priyanshu Singh" />
      <div className="content-wrapper">
        <div className="content animate-reveal space-y-16">
          <HomeIntroduction />

          <section aria-labelledby="writing-heading">
            <SectionHeading
              id="writing-heading"
              index="01"
              action={<SectionLink href="/writing">All posts</SectionLink>}
            >
              Writing
            </SectionHeading>
            <Suspense fallback={<ScreenLoadingSpinner />}>
              <WritingList items={items} />
            </Suspense>
          </section>

          <HomeSkills />

          <HomeClosing />
        </div>
      </div>
    </ScrollArea>
  )
}
