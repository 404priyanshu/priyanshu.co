import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { HomeIntroduction } from '@/components/home-introduction'
import { PageTitle } from '@/components/page-title'
import { ProjectList } from '@/components/project-list'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { WritingList } from '@/components/writing-list'
import { getAllPosts } from '@/lib/markdown'
import { getItemsByYear, getSortedPosts } from '@/lib/utils'

async function fetchData() {
  const allPosts = await getAllPosts()
  const sortedPosts = getSortedPosts(allPosts)
  const items = getItemsByYear(sortedPosts)
  return { items }
}

export default async function Home() {
  const { items } = await fetchData()

  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Priyanshu Singh" />
      <div className="content-wrapper">
        <div className="content animate-reveal space-y-12">
          {/* Main Title Section */}
          <PageTitle title="Home" className="lg:hidden" />

          <HomeIntroduction />

          {/* Projects Section */}
          <section className="space-y-4 border-t border-zinc-100 pt-4" aria-labelledby="projects-heading">
            <h2
              id="projects-heading"
              className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400 uppercase select-none"
            >
              Projects
            </h2>
            <ProjectList />
          </section>

          {/* Writing Section */}
          <div className="space-y-4 border-t border-zinc-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400 uppercase select-none">
                Latest Publications
              </span>
              <Link
                href="/writing"
                className="group inline-flex items-center gap-1 font-mono text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-950"
              >
                All posts
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <Suspense fallback={<ScreenLoadingSpinner />}>
              <WritingList items={items} />
            </Suspense>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
