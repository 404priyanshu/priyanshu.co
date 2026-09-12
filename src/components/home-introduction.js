import Image from 'next/image'

import styles from './home-introduction.module.css'

export function HomeIntroduction() {
  return (
    <section aria-labelledby="intro-heading" className={styles.intro}>
      <div className={styles.identity}>
        <Image src="/assets/me.jpg" alt="" priority width={36} height={36} className={styles.portrait} />
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
