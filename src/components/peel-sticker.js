'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

const MIN_PEEL = 0.2
const TAP_DISTANCE = 4

// A sticker whose top-right corner peels back. Hover lifts the corner, a press-and-drag
// peels it as far as you pull, and letting go snaps it flat with a little spring. A tap
// on touch screens peeks the corner once.
//
// The artwork renders twice: the front, with the peeled corner clipped away, and the
// back, the same corner mirrored across the fold line and painted as plain paper. One
// number drives both: --peel, 1 when flat (see .peel-sticker in globals.css).
// Decorative: the sticker carries no meaning, so assistive tech skips it.
export function PeelSticker({ size = 56, className, children }) {
  const ref = useRef(null)
  const drag = useRef(null)
  const peekTimer = useRef(0)

  // Peel the corner a little, once, shortly after the page settles, so people can see
  // the sticker moves. Skipped for reduced motion.
  useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    peekTimer.current = window.setTimeout(() => peek(element), 1400)
    return () => window.clearTimeout(peekTimer.current)
  }, [])

  function peek(element) {
    element.dataset.peeked = ''
    window.clearTimeout(peekTimer.current)
    peekTimer.current = window.setTimeout(() => delete element.dataset.peeked, 650)
  }

  function onPointerDown(event) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY, moved: false }
  }

  function onPointerMove(event) {
    const start = drag.current
    if (!start) return
    // The corner travels down and to the left as it peels, so pulling either way counts.
    const pulled = (start.x - event.clientX + (event.clientY - start.y)) / 2
    if (!start.moved && Math.abs(pulled) < TAP_DISTANCE) return
    start.moved = true
    const element = event.currentTarget
    element.dataset.dragging = ''
    const peel = Math.min(1, Math.max(MIN_PEEL, 1 - pulled / size))
    element.style.setProperty('--peel', String(peel))
  }

  function onPointerUp(event) {
    const element = event.currentTarget
    const wasTap = drag.current && !drag.current.moved
    drag.current = null
    delete element.dataset.dragging
    // Back to the stylesheet's value: flat, or lifted while hovered. The transition
    // springs it there.
    element.style.removeProperty('--peel')
    if (wasTap && event.pointerType !== 'mouse') peek(element)
  }

  return (
    <span
      ref={ref}
      aria-hidden="true"
      style={{ '--size': size }}
      className={cn('peel-sticker', className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <span className="peel-sticker-shadow">
        <span className="peel-sticker-front">{children}</span>
      </span>
      <span className="peel-sticker-back">
        <span className="peel-sticker-flap">{children}</span>
      </span>
    </span>
  )
}
