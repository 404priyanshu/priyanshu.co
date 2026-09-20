'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export function ArticleToc({ headings }) {
  const navRef = useRef(null)
  const indicatorRef = useRef(null)
  const [activeId, setActiveId] = useState(headings[0]?.id)

  useEffect(() => {
    const scrollArea = navRef.current?.closest('.scrollable-area')
    if (!scrollArea) return
    const sections = headings.map(({ id }) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return
    let frame = 0
    let needsMeasure = true
    let stops = []
    let currentId
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const update = () => {
      frame = 0
      // Cache layout outside the scroll hot path. Only transforms change per frame.
      if (needsMeasure) {
        const origin = scrollArea.getBoundingClientRect().top + scrollArea.clientTop
        const maxScroll = Math.max(0, scrollArea.scrollHeight - scrollArea.clientHeight)
        const links = [...navRef.current.querySelectorAll('a')]
        stops = sections.map((section) => {
          const link = links.find((link) => link.hash === `#${section.id}`)
          return {
            id: section.id,
            scroll: Math.max(
              0,
              Math.min(maxScroll, section.getBoundingClientRect().top - origin + scrollArea.scrollTop - 112)
            ),
            top: link.offsetTop,
            height: link.offsetHeight
          }
        })
        needsMeasure = false
      }
      const position = scrollArea.scrollTop
      let index = 0
      while (index < stops.length - 1 && position >= stops[index + 1].scroll) index++
      const current = stops[index]
      const next = stops[index + 1] ?? current
      const distance = next.scroll - current.scroll
      const progress =
        reducedMotion.matches || distance <= 0 ? 0 : Math.max(0, Math.min(1, (position - current.scroll) / distance))
      const top = current.top + (next.top - current.top) * progress
      const height = current.height + (next.height - current.height) * progress
      indicatorRef.current.style.transform = `translate3d(0, ${top}px, 0) scaleY(${height})`
      indicatorRef.current.style.opacity = '1'
      if (current.id !== currentId) {
        currentId = current.id
        setActiveId(current.id)
      }
    }
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const measure = () => {
      needsMeasure = true
      scheduleUpdate()
    }

    scrollArea.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', measure)
    reducedMotion.addEventListener('change', scheduleUpdate)
    const observer = new ResizeObserver(measure)
    const article = scrollArea.querySelector('article')
    if (article) observer.observe(article)
    observer.observe(navRef.current)
    observer.observe(scrollArea)
    scheduleUpdate()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      scrollArea.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', measure)
      reducedMotion.removeEventListener('change', scheduleUpdate)
    }
  }, [headings])

  return (
    <nav ref={navRef} aria-label="On this page">
      <p className="mb-4 font-mono text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">On this page</p>
      <div className="relative border-l border-zinc-200">
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 -left-px h-px w-0.5 origin-top bg-zinc-900 opacity-0 will-change-transform"
        />
        {headings.map(({ id, text }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={activeId === id ? 'location' : undefined}
            className={cn(
              '-ml-px block border-l-2 border-transparent py-2 pl-4 text-[13px] leading-relaxed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
              activeId === id ? 'font-medium text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
            )}
          >
            {text}
          </a>
        ))}
      </div>
    </nav>
  )
}
