'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { WritingLink } from '@/components/writing-link'
import { useViewData } from '@/hooks/useViewData'
import { cn } from '@/lib/utils'

export const WritingListLayout = ({ list, isMobile }) => {
  const viewData = useViewData()
  const pathname = usePathname()

  // Add this debug log
  console.log('🔍 WritingListLayout - viewData:', viewData)
  console.log('🔍 WritingListLayout - list:', list)

  const memoizedList = useMemo(() => {
    return list.map((post) => {
      const viewCount = viewData?.find((item) => item.slug === post.slug)?.count
      const isActive = pathname === `/writing/${post.slug}`

      console.log(`📝 Post: ${post.slug}, viewCount: ${viewCount}`)

      return <WritingLink key={post.slug} post={post} viewCount={viewCount} isMobile={isMobile} isActive={isActive} />
    })
  }, [list, viewData, pathname, isMobile])

  return <div className={cn(!isMobile && 'flex flex-col gap-1 text-sm')}>{memoizedList}</div>
}
