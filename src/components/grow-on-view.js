'use client'

import { useEffect, useRef, useState } from 'react'

import { SCROLL_AREA_ID } from '@/lib/constants'
import { cn } from '@/lib/utils'

// Grows a card to full size the first time it scrolls into view, then leaves it there.
// The server renders it at full size. After mount, a card that is still below the fold
// is shrunk while off screen (nobody sees that), then grows once its top passes 90% of
// the screen. Cards already on screen, readers with reduced motion and no-JS visitors
// never shrink.
export function GrowOnView({ className, children }) {
  const ref = useRef(null)
  const [state, setState] = useState('static')

  useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (element.getBoundingClientRect().top < window.innerHeight) return

    setState('waiting')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setState('grown')
        observer.disconnect()
      },
      // The home page scrolls inside the scroll area, not the window. The huge top margin
      // counts everything above the screen as "in view", so a fast flick or a jump to
      // #contact that skips a card in one frame still grows it.
      { root: document.getElementById(SCROLL_AREA_ID), rootMargin: '100000px 0px -10% 0px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} data-grow={state} className={cn('grow-on-view', className)}>
      {children}
    </div>
  )
}
