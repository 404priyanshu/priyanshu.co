import { FloatingHeader } from '@/components/floating-header'
import { HomeIntroduction } from '@/components/home-introduction'
import { ExploreLinks, HomeSection } from '@/components/home-sections'
import { ProjectList } from '@/components/project-list'
import { RecentWriting } from '@/components/recent-writing'
import { ScrollArea } from '@/components/scroll-area'
import { getAllPosts } from '@/lib/markdown'

const RECENT_POST_COUNT = 4

export default async function Home() {
  // Only the fields the list renders: passing whole posts to a client component
  // would serialize every article's Markdown into the page.
  const posts = (await getAllPosts())
    .slice(0, RECENT_POST_COUNT)
    .map(({ slug, title, description, date }) => ({ slug, title, description, date }))

  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Priyanshu Singh" />
      <div className="content-wrapper">
        <div className="content animate-reveal space-y-14">
          <HomeIntroduction />

          <HomeSection id="building-heading" title="Currently building">
            <ProjectList />
          </HomeSection>

          <HomeSection id="writing-heading" title="Recent writing" link={{ href: '/writing', label: 'All posts' }}>
            <RecentWriting posts={posts} />
          </HomeSection>

          <HomeSection id="explore-heading" title="Explore">
            <ExploreLinks />
          </HomeSection>
        </div>
      </div>
    </ScrollArea>
  )
}
