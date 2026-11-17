import { cn } from '@/lib/utils'

// A pink "New" with a loop scribbled around it, as if circled by pen. The loop draws
// itself once (see .new-badge in globals.css). It overshoots its start, like a quick
// hand-drawn circle does. The viewBox is about the badge's own shape, so the stroke keeps
// an even width. The SVG is decoration only; readers hear the word "New".
export function NewBadge({ className }) {
  return (
    <span className={cn('new-badge', className)}>
      New
      <svg viewBox="0 0 48 30" fill="none" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path
          pathLength="1"
          d="M42.75 2.5C33.75 0 12 0.5 5.25 8C0.4 13.5 3 23.5 15.75 25.5C27.75 27.5 42 24 45 16C47.6 9.5 41.25 5.5 30.75 5C26.25 4.8 22.5 5.6 19.5 7"
        />
      </svg>
    </span>
  )
}
