import { notFound, permanentRedirect } from 'next/navigation'

import { getPostBySlug } from '@/lib/markdown'

// Post slugs are lowercase words and dashes, matching the pattern the API
// routes validate against. Anything else — /favicon.ico, /robots.txt, asset
// probes — can never be a post, so reject it without touching the filesystem.
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,120}$/i

/**
 * Legacy root-level post URLs (e.g. /understanding-react-memo) predate the
 * move to /writing/:slug. Redirect the ones that still resolve to a post and
 * 404 everything else, so the canonical post lives only at /writing/:slug.
 */
export default async function LegacyPostRedirect({ params }) {
  const { slug } = await params

  if (!SLUG_PATTERN.test(slug)) notFound()

  const post = getPostBySlug(slug)

  if (!post) notFound()

  permanentRedirect(`/writing/${post.slug}`)
}
