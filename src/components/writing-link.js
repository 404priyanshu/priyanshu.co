import { domAnimation, LazyMotion, m } from 'framer-motion'
import Link from 'next/link'

import { cn, getDateTimeFormat, viewCountFormatter } from '@/lib/utils'

export const WritingLink = ({ post, viewCount, isMobile, isActive }) => {
  const date = post.date || post.sys.firstPublishedAt
  const formattedDate = getDateTimeFormat(date)
  const formattedViewCount = viewCount ? viewCountFormatter.format(viewCount) : null

  return (
    <LazyMotion features={domAnimation}>
      <Link
        key={post.slug}
        href={`/writing/${post.slug}`}
        className={cn(
          'group flex flex-col gap-1 border-l transition-colors duration-300',
          !isMobile && isActive
            ? 'border-zinc-950 bg-white text-zinc-950'
            : 'border-transparent text-zinc-800 hover:border-zinc-300 hover:bg-white',
          isMobile ? 'border-b border-l-0 px-4 py-3 text-sm hover:bg-zinc-50' : 'px-3 py-2.5'
        )}
      >
        <span className="font-sans text-[0.9rem] leading-snug font-medium tracking-tight">{post.title}</span>
        <span
          className={cn(
            'font-mono text-[0.68rem] tracking-[0.08em] text-zinc-500 uppercase transition-colors duration-300',
            isActive && 'text-zinc-600'
          )}
        >
          <time dateTime={date}>{formattedDate}</time>{' '}
          <span>
            {formattedViewCount ? (
              <m.span
                key={`${post.slug}-views-loaded`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="tabular-nums"
              >
                &middot; {formattedViewCount} {formattedViewCount === 1 ? 'view' : 'views'}
              </m.span>
            ) : (
              <m.span key={`${post.slug}-views-loading`} />
            )}
          </span>
        </span>
      </Link>
    </LazyMotion>
  )
}
