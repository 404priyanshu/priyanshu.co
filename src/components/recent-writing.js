'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { useViewData } from '@/hooks/useViewData'
import { getDateTimeFormat, viewCountFormatter } from '@/lib/utils'

import styles from './home-sections.module.css'

export function RecentWriting({ posts }) {
  const { data, status } = useViewData()

  const views = useMemo(() => new Map(data?.map(({ slug, count }) => [slug, count])), [data])

  return (
    <ul className={styles.posts}>
      {posts.map(({ slug, title, description, date }) => {
        const count = views.get(slug) ?? 0

        return (
          <li key={slug}>
            <Link href={`/writing/${slug}`} className={styles.post}>
              <span className={styles.postMeta}>
                <time dateTime={date}>{getDateTimeFormat(date)}</time>
                {status === 'ready' && (
                  <span>
                    {viewCountFormatter.format(count)} {count === 1 ? 'view' : 'views'}
                  </span>
                )}
              </span>
              <span className={styles.postTitle}>{title}</span>
              {description && <span className={styles.postDescription}>{description}</span>}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
