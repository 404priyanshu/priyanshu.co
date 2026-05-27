'use client'

import { useEffect, useRef } from 'react'

import { SCROLL_AREA_ID } from '@/lib/constants'

export function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    const scrollArea = document.getElementById(SCROLL_AREA_ID)
    if (!scrollArea || !barRef.current) return

    // Detect native CSS scroll timeline support
    const hasCSSScrollTimeline = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline', 'scroll()')

    if (hasCSSScrollTimeline) {
      // Set scroll timeline on the scrollPort container
      scrollArea.style.scrollTimeline = '--post-scroll block'
      
      // Drive progress bar animation using the container timeline
      barRef.current.style.animationName = 'grow-progress'
      barRef.current.style.animationTimeline = '--post-scroll'
      barRef.current.style.animationFillMode = 'both'
      barRef.current.style.animationTimingFunction = 'linear'
      barRef.current.style.animationDuration = 'auto'
    } else {
      // Passive event listener fallback for browsers like Firefox
      const handleScroll = () => {
        const scrollTop = scrollArea.scrollTop
        const scrollHeight = scrollArea.scrollHeight - scrollArea.clientHeight
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${progress})`
        }
      }

      scrollArea.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll() // Initialize state

      return () => {
        scrollArea.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <div 
      className="sticky top-0 left-0 right-0 z-50 h-[3px] w-full bg-zinc-100/60 overflow-hidden" 
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full w-full bg-gradient-to-r from-zinc-400 via-zinc-700 to-zinc-950 origin-[0%_50%] scale-x-0"
        style={{
          animationName: 'none',
          willChange: 'transform'
        }}
      />
    </div>
  )
}
