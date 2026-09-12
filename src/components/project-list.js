import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

import styles from './project-list.module.css'

const projects = [
  {
    name: 'ClassVault',
    status: 'Currently building',
    description: 'A better place for college notes, study plans, and getting through the semester together.',
    url: 'https://classvault.in',
    domain: 'classvault.in',
    image: '/assets/classvault-paper-archive.avif'
  }
]

export function ProjectList() {
  return (
    <div className={styles.list}>
      {projects.map((project) => (
        <a
          key={project.url}
          className={styles.project}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Explore ${project.name} (opens in a new tab)`}
        >
          <div className={styles.projectCopy}>
            <span className={styles.status}>{project.status}</span>
            <h3>
              {project.name}
              <span className={styles.period}>.</span>
            </h3>
            <p>{project.description}</p>
            <span className={styles.projectLink}>
              Explore {project.name} <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
            </span>
          </div>
          <div className={styles.artwork} aria-hidden="true">
            <Image src={project.image} alt="" priority width={1254} height={1254} sizes="150px" />
          </div>
          <span className={styles.domain}>{project.domain}</span>
        </a>
      ))}
    </div>
  )
}
