'use client'

import { useRef } from 'react'

import { cn } from '@/lib/utils'

export const SpotlightCard = ({ children, className, ...props }) => {
  const cardRef = useRef(null)

  const handlePointerMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={cn('spotlight-card group', className)}
      {...props}
    >
      {/* Glowing border highlight */}
      <div className="spotlight-glow" aria-hidden="true" />
      {/* Glowing background highlight */}
      <div className="spotlight-glow-bg" aria-hidden="true" />
      {/* Inner layout element */}
      <div className="relative z-1">{children}</div>
    </div>
  )
}
