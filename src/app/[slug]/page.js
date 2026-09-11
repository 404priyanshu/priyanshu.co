import { notFound, permanentRedirect } from 'next/navigation'

import { getPostBySlug } from '@/lib/markdown'

/**
 * Legacy root-level post URLs (e.g. /understanding-react-memo) predate the
 * move to /writing/:slug. Redirect the ones that still resolve to a post and
 * 404 everything else, so the canonical post lives only at /writing/:slug.
 */
export default async function LegacyPostRedirect({ params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  permanentRedirect(`/writing/${post.slug}`)
}
