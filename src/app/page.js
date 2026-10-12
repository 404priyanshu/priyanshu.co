import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { HomeCard } from '@/components/home-card'
import { HomeClosing, HomeIntroduction, HomeSkills } from '@/components/home-introduction'
import { HomeProjects } from '@/components/home-projects'
import { PageTitle } from '@/components/page-title'
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
  const latestPosts = getSortedPosts(allPosts).slice(0, LATEST_POST_COUNT)
  const items = getItemsByYear(latestPosts)
  return { items }
}

export default async function Home() {
  const { items } = await fetchData()

  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Priyanshu Singh" />
      <div className="content-wrapper">
        <div className="content animate-reveal space-y-10">
          <PageTitle title="Home" className="lg:hidden" />

          <HomeIntroduction />

          <HomeProjects />

          <HomeSkills />

          <HomeCard innerClassName="bg-white px-5 pt-5 pb-2">
            <section className="space-y-4" aria-labelledby="writing-heading">
              <div className="flex items-baseline justify-between">
                <h2 id="writing-heading">Writing</h2>
                <Link
                  href="/writing"
                  className="group inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  All posts
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <Suspense fallback={<ScreenLoadingSpinner />}>
                <WritingList items={items} />
              </Suspense>
            </section>
          </HomeCard>

          <HomeClosing />
        </div>
      </div>
    </ScrollArea>
  )
}
