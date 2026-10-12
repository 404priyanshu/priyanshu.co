import { cn } from '@/lib/utils'

// Widget card for the home page: a white rim around a soft inner panel.
export function HomeCard({ className, innerClassName, style, children }) {
  return (
    <div
      style={style}
      className={cn(
        'block rounded-[26px] bg-white p-1.5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-8px_rgb(0_0_0/0.08)] ring-1 ring-black/[0.04]',
        className
      )}
    >
      <div className={cn('rounded-[20px] bg-gray-50 p-5', innerClassName)}>{children}</div>
    </div>
  )
}

export const iconTileClassName =
  'items-center justify-center border border-gray-200 bg-white text-gray-700 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_2px_6px_rgb(0_0_0/0.04)]'

// Entrance: sections rise in one after another, in index order (.rise-in in globals.css).
export const rise = (index) => ({ '--rise-index': index })

// Small icon tile that sits inside a line of prose. Decorative: the words carry the meaning.
export function InlineChip({ children }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'mx-1 inline-flex size-[1.6em] translate-y-[-0.08em] rounded-[0.45em] align-middle',
        iconTileClassName
      )}
    >
      {children}
    </span>
  )
}

// A highlighter stroke that draws in from the left after `delay` ms (.highlight-in in globals.css).
export function Highlight({ children, delay = 0, color = '#fff2a8' }) {
  return (
    <mark className="highlight-in text-gray-900" style={{ '--highlight': color, '--highlight-delay': `${delay}ms` }}>
      {children}
    </mark>
  )
}

// A spinning ring, the icon for anything real-time.
export function LiveSpinner({ className }) {
  return (
    <span
      className={cn('size-3 rounded-full border-2 border-sky-100 border-t-sky-500 motion-safe:animate-spin', className)}
    />
  )
}
