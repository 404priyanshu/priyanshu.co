import { sharedMetadata } from '@/app/shared-metadata'
import { PROFILES } from '@/lib/constants'

export const SITE_URL = sharedMetadata.url

// Next.js merges metadata shallowly: a page that sets `openGraph` or `alternates`
// replaces the parent's whole object. So every page builds both objects here, with
// its own canonical URL, og:url and the shared site-wide fields.
const RSS_FEED = { 'application/rss+xml': [{ url: '/writing.xml', title: `${sharedMetadata.title} — Writing` }] }

export const DEFAULT_OG_IMAGE = {
  url: '/opengraph-image',
  width: sharedMetadata.ogImage.width,
  height: sharedMetadata.ogImage.height,
  alt: `${sharedMetadata.title}, full-stack and backend developer. Open to work.`
}

export const baseOpenGraph = {
  siteName: sharedMetadata.title,
  locale: 'en_IN',
  type: 'website'
}

export const rssAlternates = { types: RSS_FEED }

/**
 * Metadata for one indexable page.
 * @param {object} options
 * @param {string | { absolute: string }} options.title
 * @param {string} options.description
 * @param {string} options.path Site-relative path, used for the canonical URL and og:url.
 * @param {object} [options.openGraph] Extra Open Graph fields, such as `type` or `images`.
 */
export function pageMetadata({ title, description, path, openGraph = {}, ...rest }) {
  return {
    title,
    description,
    alternates: { canonical: path, ...rssAlternates },
    openGraph: {
      ...baseOpenGraph,
      title,
      description,
      url: path,
      images: [DEFAULT_OG_IMAGE],
      ...openGraph
    },
    ...rest
  }
}

export const PERSON_ID = `${SITE_URL}/#person`

export const personJsonLd = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Priyanshu Singh',
  url: SITE_URL,
  image: `${SITE_URL}/assets/me.jpg`,
  jobTitle: 'Full-stack and Backend Developer',
  description: sharedMetadata.description,
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Bennett University' },
  address: { '@type': 'PostalAddress', addressCountry: 'IN' },
  sameAs: Object.values(PROFILES).map((profile) => profile.url)
}

/** Serialize JSON-LD for a <script> tag. Escapes `<` so content cannot close the tag. */
export function serializeJsonLd(data) {
  return JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c')
}
