'use client'

import { Radio } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { cn } from '@/lib/utils'

export function WritingShell({ posts, children }) {
  const pathname = usePathname()
  const isIndex = pathname === '/writing'
  const selected = isIndex ? posts[0]?.slug : pathname.split('/').pop()
  const router = useRouter()
  const latest = posts[0]?.slug

  // On desktop /writing shows the latest post beside the list, so give it that
  // post's URL; otherwise the address bar says /writing and can't be shared.
  // Phones keep /writing, where it's the list on its own.
  useEffect(() => {
    if (!isIndex || !latest) return
    const desktop = window.matchMedia('(min-width: 1024px)')
    const openLatest = () => desktop.matches && router.replace(`/writing/${latest}`, { scroll: false })
    openLatest()
    desktop.addEventListener('change', openLatest)
    return () => desktop.removeEventListener('change', openLatest)
  }, [isIndex, latest, router])

  return (
    <div className="flex min-w-0 flex-1">
      <aside
        aria-label="Writing archive"
        className={cn(
          'h-dvh w-full shrink-0 overflow-y-auto bg-zinc-50/70 lg:w-[290px] lg:border-r lg:border-zinc-200 xl:w-[320px]',
          !isIndex && 'hidden lg:block'
        )}
      >
        {isIndex && <FloatingHeader title="Writing" />}
        <header className="sticky top-0 z-10 hidden h-16 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 lg:flex">
          <Link href="/writing" className="text-sm font-semibold text-zinc-900">
            Writing
          </Link>
          <a
            href="/writing.xml"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100"
          >
            <Radio size={13} aria-hidden="true" /> RSS feed
          </a>
        </header>
        <nav aria-label="Articles" className="p-3">
          <ul className="space-y-1">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/writing/${post.slug}`}
                  aria-current={selected === post.slug ? 'page' : undefined}
                  className={cn(
                    'block rounded-lg px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2',
                    selected === post.slug ? 'bg-zinc-950 text-white' : 'text-zinc-800 hover:bg-zinc-200/60'
                  )}
                >
                  <span className="block text-sm leading-snug font-medium">{post.title}</span>
                  <time
                    dateTime={post.date}
                    className={cn('mt-1.5 block text-xs', selected === post.slug ? 'text-zinc-400' : 'text-zinc-500')}
                  >
                    {post.displayDate}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
          {!posts.length && <p className="px-3 text-sm text-zinc-500">New writing is on the way.</p>}
        </nav>
      </aside>
      <div className={cn('min-w-0 flex-1', isIndex && 'hidden lg:block')}>{children}</div>
    </div>
  )
}
