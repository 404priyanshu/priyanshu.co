import { SCROLL_AREA_ID } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const ScrollArea = ({ useScrollAreaId = false, className, ...rest }) => (
  <div
    {...(useScrollAreaId && { id: SCROLL_AREA_ID })}
    // Next.js focuses the page container after navigation; only suppress its outline, not descendant focus rings.
    className={cn('scrollable-area relative flex w-full flex-col', useScrollAreaId && 'focus:outline-none', className)}
    {...rest}
  />
)
