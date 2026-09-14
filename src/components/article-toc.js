'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export function ArticleToc({ headings }) {
  const navRef = useRef(null)
  const [activeId, setActiveId] = useState(headings[0]?.id)

  useEffect(() => {
    const scrollArea = navRef.current?.closest('.scrollable-area')
    if (!scrollArea) return
    const sections = headings.map(({ id }) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return
    let frame = 0

    const update = () => {
      frame = 0
      const readingLine = scrollArea.getBoundingClientRect().top + 112
      let current = sections[0]
      for (const section of sections) {
        if (section.getBoundingClientRect().top > readingLine) break
        current = section
      }
      // Short final sections cannot always reach the reading line.
      if (scrollArea.scrollTop > 0 && scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - 2) {
        current = sections[sections.length - 1]
      }
      setActiveId(current.id)
    }
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    scrollArea.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    const observer = new ResizeObserver(scheduleUpdate)
    const article = scrollArea.querySelector('article')
    if (article) observer.observe(article)
    scheduleUpdate()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      scrollArea.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [headings])

  return (
    <nav ref={navRef} aria-label="On this page">
      <p className="mb-4 font-mono text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">On this page</p>
      <div className="border-l border-zinc-200">
        {headings.map(({ id, text }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={activeId === id ? 'location' : undefined}
            className={cn(
              '-ml-px block border-l-2 py-2 pl-4 text-[13px] leading-relaxed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
              activeId === id
                ? 'border-zinc-900 font-medium text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            )}
          >
            {text}
          </a>
        ))}
      </div>
    </nav>
  )
}
