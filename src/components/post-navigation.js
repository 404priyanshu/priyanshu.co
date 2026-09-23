import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

function PostLink({ post, direction }) {
  const isNewer = direction === 'newer'

  return (
    <Link
      href={`/writing/${post.slug}`}
      className={cn(
        'group flex flex-col gap-1.5 rounded-xl border border-zinc-200 p-4 no-underline transition-colors hover:border-zinc-300 hover:bg-zinc-50',
        isNewer && 'sm:items-end sm:text-right'
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
        {!isNewer && (
          <ArrowLeft size={13} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
        )}
        {isNewer ? 'Newer post' : 'Older post'}
        {isNewer && (
          <ArrowRight size={13} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
      <span className="text-[0.95rem] leading-snug font-medium text-zinc-900">{post.title}</span>
    </Link>
  )
}

// Posts are sorted newest first, so the older post sits on the left and the
// newer one on the right, like turning pages back and forward.
export function PostNavigation({ older, newer }) {
  if (!older && !newer) return null

  return (
    <nav aria-label="More writing" className="grid gap-3 sm:grid-cols-2">
      {older ? <PostLink post={older} direction="older" /> : <span className="hidden sm:block" />}
      {newer && <PostLink post={newer} direction="newer" />}
    </nav>
  )
}
