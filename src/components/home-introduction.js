import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

import styles from './home-introduction.module.css'

export function HomeIntroduction() {
  return (
    <section aria-labelledby="intro-heading" className={styles.intro}>
      <div className={styles.identity}>
        <Image src="/assets/me.jpg" alt="" width={36} height={36} className={styles.portrait} />
        <p>
          <span>Priyanshu Singh</span>
          <span className={styles.role}>Software engineer, India</span>
        </p>
      </div>

      <h1 id="intro-heading" className={styles.headline}>
        I build for the web.
        <span>And what runs behind it.</span>
      </h1>
      <p className={styles.description}>
        Curious about how things work. Happiest turning a hard problem into something people can actually use.
      </p>

      <a
        className={styles.project}
        href="https://classvault.in"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Explore ClassVault (opens in a new tab)"
      >
        <div className={styles.projectCopy}>
          <span className={styles.current}>Currently building</span>
          <h2>
            ClassVault<span className={styles.period}>.</span>
          </h2>
          <p>A better place for college notes, study plans, and getting through the semester together.</p>
          <span className={styles.projectLink}>
            Explore ClassVault <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </span>
        </div>
        <div className={styles.artwork} aria-hidden="true">
          <Image src="/assets/classvault-paper-archive.avif" alt="" priority width={1254} height={1254} sizes="240px" />
        </div>
        <span className={styles.domain}>classvault.in</span>
      </a>

      <div className={styles.work}>
        <h2>The work I want to do</h2>
        <div>
          <p>Build tools people return to, and the systems that keep them running.</p>
          <p className={styles.tools}>Python, Node.js, AWS & PostgreSQL. React when it needs a face.</p>
        </div>
      </div>
    </section>
  )
}
