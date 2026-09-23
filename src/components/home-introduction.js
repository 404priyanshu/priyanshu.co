import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { PROFILES } from '@/lib/constants'

import styles from './home-introduction.module.css'

const STACK = ['Python', 'Node.js', 'AWS', 'PostgreSQL', 'React']

export function HomeIntroduction() {
  return (
    <section aria-labelledby="intro-heading" className={styles.intro}>
      <div className={styles.identity}>
        <Image src="/assets/me.jpg" alt="" priority width={44} height={44} className={styles.portrait} />
        <p>
          <span className={styles.name}>Priyanshu Singh</span>
          <span className={styles.role}>Software engineer · India</span>
        </p>
      </div>

      <h1 id="intro-heading" className={styles.headline}>
        I build for the web.
        <span>And what runs behind it.</span>
      </h1>

      <p className={styles.description}>
        Curious about how things work, and happiest turning a hard problem into something people can actually use. I
        want to build tools people return to, and the systems that keep them running.
      </p>

      <ul className={styles.stack} aria-label="Tools I work with">
        {STACK.map((tool) => (
          <li key={tool}>{tool}</li>
        ))}
      </ul>

      <div className={styles.actions}>
        <Link href="/writing" className={styles.primary}>
          Read my writing
          <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
        </Link>
        {[PROFILES.github, PROFILES.linkedin].map((profile) => (
          <a
            key={profile.url}
            href={profile.url}
            className={styles.secondary}
            target="_blank"
            rel="noopener noreferrer"
          >
            {profile.title}
            <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  )
}
