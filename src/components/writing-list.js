'use client'

import { domAnimation, LazyMotion, m } from 'framer-motion'
import Link from 'next/link'
import { useMemo } from 'react'

import { useViewData } from '@/hooks/useViewData'
import { cn, dateWithDayAndMonthFormatter, dateWithMonthAndYearFormatter, viewCountFormatter } from '@/lib/utils'

export const WritingList = ({ items }) => {
  const { data: viewData, status: viewStatus } = useViewData()

  // Preprocess viewData into a map for efficient lookups
  const viewDataMap = useMemo(() => {
    const map = new Map()
    viewData?.forEach((item) => {
      map.set(item.slug, item.count)
    })
    return map
  }, [viewData])

  // Memoize animation props
  const animationProps = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    }),
    []
  )

  // Memoize the items mapping to prevent unnecessary re-renders
  const renderedItems = useMemo(() => {
    return items.map((item) => {
      const [year, itemsArr] = item

      return (
        <ul className="group/list list-none" key={year}>
          {itemsArr.map((item, itemIndex) => {
            const {
              title,
              slug,
              date,
              sys = {} // Add default empty object to prevent errors
            } = item

            const { firstPublishedAt } = sys
            const dateObj = new Date(date || firstPublishedAt)
            const dateWithDayAndMonth = dateWithDayAndMonthFormatter.format(dateObj)
            const dateWithMonthAndYear = dateWithMonthAndYearFormatter.format(dateObj)

            const viewCount = viewDataMap.get(slug) ?? 0
            const formattedViewCount =
              viewStatus === 'ready' ? viewCountFormatter.format(viewCount) : viewStatus === 'loading' ? '...' : 'N/A'
            const viewLabel =
              viewStatus === 'ready'
                ? `${formattedViewCount} views`
                : viewStatus === 'loading'
                  ? 'Loading views'
                  : 'Views unavailable'

            return (
              <li key={slug} className="group/list-item grid grid-cols-6 p-0 group-hover/list-wrapper:text-gray-300">
                <span
                  className={cn(
                    'pointer-events-none col-span-1 hidden items-center tabular-nums transition-colors duration-300 group-hover/list:text-gray-900 md:grid',
                    itemIndex === 0 && 'border-t border-gray-200'
                  )}
                >
                  {itemIndex === 0 ? year : ''}
                </span>
                <Link
                  href={`/writing/${slug}`}
                  className="col-span-6 group-hover/list-item:text-gray-900 md:col-span-5"
                >
                  {/* Phones: the title takes the full width, with the date under it. */}
                  <span className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-t border-gray-200 py-4 md:grid-cols-8 md:gap-2">
                    <span className="col-start-1 row-start-2 text-left text-[13px] tabular-nums opacity-60 md:col-span-1 md:row-start-1 md:text-sm md:opacity-100">
                      <time dateTime={date} className="hidden md:block">
                        {dateWithDayAndMonth}
                      </time>
                      <time dateTime={date} className="md:hidden">
                        {dateWithMonthAndYear}
                      </time>
                    </span>
                    <span className="col-start-1 row-start-1 line-clamp-3 md:col-span-6 md:col-start-2">{title}</span>
                    {formattedViewCount && (
                      <span className="col-start-2 row-span-2 row-start-1 md:col-span-1 md:col-start-8 md:row-span-1">
                        <m.span
                          key={`${slug}-views`}
                          className="flex justify-end tabular-nums"
                          title={viewLabel}
                          aria-label={viewLabel}
                          {...animationProps}
                        >
                          {formattedViewCount}
                        </m.span>
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )
    })
  }, [animationProps, items, viewDataMap, viewStatus])

  return useMemo(
    () => (
      <LazyMotion features={domAnimation}>
        <div className="text-sm">
          <div className="grid grid-cols-6 py-2 font-medium text-gray-500">
            <span className="col-span-1 hidden text-left md:grid">Year</span>
            <span className="col-span-6 md:col-span-5">
              <span className="grid grid-cols-[1fr_auto] items-center md:grid-cols-8">
                <span className="hidden text-left md:col-span-1 md:block">Date</span>
                <span className="md:col-span-6">Title</span>
                <span className="text-right md:col-span-1">Views</span>
              </span>
            </span>
          </div>

          <div className="group/list-wrapper">{renderedItems}</div>
        </div>
      </LazyMotion>
    ),
    [renderedItems]
  )
}
