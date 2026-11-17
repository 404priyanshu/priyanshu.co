import { Suspense } from 'react'

import { sharedMetadata } from '@/app/shared-metadata'
import { FloatingHeader } from '@/components/floating-header'
import { HomeClosing, HomeIntroduction, HomeSkills, SectionHeading, SectionLink } from '@/components/home-introduction'
import { JsonLd } from '@/components/json-ld'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { WritingList } from '@/components/writing-list'
import { getAllPosts } from '@/lib/markdown'
import { pageMetadata, PERSON_ID, personJsonLd, SITE_URL } from '@/lib/seo'
import { getItemsByYear, getSortedPosts } from '@/lib/utils'

// The home page lists only the latest posts; "All posts" links to the rest.
const LATEST_POST_COUNT = 5

// The tab title carries the role as well as the name: many developers share the name,
// and "full-stack developer" is what recruiters search for.
const HOME_TITLE = 'Priyanshu Singh — Full-stack & Backend Developer'

export const metadata = pageMetadata({
  title: { absolute: HOME_TITLE },
  description: sharedMetadata.description,
  path: '/',
  openGraph: { title: HOME_TITLE }
})

const homeJsonLd = {
  '@graph': [
    personJsonLd,
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: sharedMetadata.title,
      url: SITE_URL,
      inLanguage: 'en',
      publisher: { '@id': PERSON_ID }
    },
    {
      '@type': 'ProfilePage',
      '@id': `${SITE_URL}/#profile`,
      url: SITE_URL,
      name: HOME_TITLE,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: { '@id': PERSON_ID }
    }
  ]
}

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
      <JsonLd data={homeJsonLd} />
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
