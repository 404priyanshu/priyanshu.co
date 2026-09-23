import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { LINKS } from '@/lib/constants'

import styles from './home-sections.module.css'

export function HomeSection({ id, title, link, children }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.sectionHeader}>
        <h2 id={id}>{title}</h2>
        {link && (
          <Link href={link.href} className={styles.sectionLink}>
            {link.label}
            <ArrowRight size={13} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

// Descriptions are shortened from each page's own metadata.
const EXPLORE = [
  { href: '/bookmarks', description: 'A curated collection of useful links and resources.' },
  { href: '/books', description: 'Books that shaped my technical thinking.' },
  { href: '/stack', description: 'Tools, hardware and software I use daily.' },
  { href: '/workspace', description: 'My desk, dev environment and hardware setup.' }
]

export function ExploreLinks() {
  return (
    <ul className={styles.explore}>
      {EXPLORE.map(({ href, description }) => {
        const { label, icon } = LINKS.find((link) => link.href === href)

        return (
          <li key={href}>
            <Link href={href} className={styles.exploreItem}>
              <span className={styles.exploreIcon} aria-hidden="true">
                {icon}
              </span>
              <span>
                <span className={styles.exploreLabel}>{label}</span>
                <span className={styles.exploreDescription}>{description}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
