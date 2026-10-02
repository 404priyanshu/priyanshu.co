import Image from 'next/image'

import styles from './home-introduction.module.css'

const STACK = ['Python', 'Node.js', 'AWS', 'PostgreSQL', 'React']

export function HomeIntroduction() {
  return (
    <section aria-labelledby="intro-heading" className={styles.intro}>
      <div className={styles.identity}>
        {/* The sidebar already shows the photo and name on desktop; phones hide the sidebar. */}
        <Image
          src="/assets/me.jpg"
          alt=""
          priority
          width={36}
          height={36}
          className={`${styles.portrait} ${styles.mobileOnly}`}
        />
        <p>
          <span className={styles.mobileOnly}>Priyanshu Singh</span>
          <span className={styles.role}>
            <span className={styles.statusDot} aria-hidden="true" />
            Based in India · Building ClassVault
          </span>
        </p>
      </div>

      <h1 id="intro-heading" className={styles.headline}>
        I build for the web.
        <span>And what runs behind it.</span>
      </h1>
      <p className={styles.description}>
        Curious about how things work. Happiest turning a hard problem into something people can actually use.
      </p>

      <div className={styles.work}>
        <h2>The work I want to do</h2>
        <div>
          <p>Build tools people return to, and the systems that keep them running.</p>
          <ul className={styles.stack} aria-label="Tools I work with">
            {STACK.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
