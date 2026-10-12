import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/lib/utils'

const SKILLS = [
  { area: 'Languages', tools: 'TypeScript, Python, JavaScript' },
  { area: 'Frameworks', tools: 'React, Next.js, Node.js, NestJS, FastAPI' },
  { area: 'Cloud & data', tools: 'AWS, PostgreSQL, Redis, Terraform' }
]

const PROJECTS = [
  {
    name: 'ClassVault',
    description: 'Notes, past papers and study roadmaps for college students, in one place.',
    status: 'Building',
    url: 'https://classvault.in'
  },
  {
    name: 'Vernier',
    description: 'AI review for pull requests that flags bugs and security vulnerabilities.',
    status: 'Live',
    url: 'https://vernier-phi.vercel.app'
  },
  {
    name: 'BlockForge',
    description: 'NFT marketplace with escrow contracts, its own chain indexer, and AWS infrastructure.',
    status: 'GitHub',
    url: 'https://github.com/404priyanshu/BlockForgeNFT'
  },
  {
    name: 'CodeDuel',
    description: 'Shared code editor with real-time sync, for interviews and pair programming.',
    status: 'GitHub',
    url: 'https://github.com/404priyanshu/codeduel'
  },
  {
    name: 'Crumbprint',
    description: 'Local-first CLI that audits your Instagram data export for privacy risks.',
    status: 'GitHub',
    url: 'https://github.com/404priyanshu/crumbprint'
  }
]

const linkClassName = 'underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900'

// Same table language as the writing list: a muted header, ruled rows, and the
// hovered row stays dark while the others fade. The three columns line up with
// its Year, Title and Views columns.
const gridClassName = 'grid-cols-[6.5rem_1fr_auto] md:grid-cols-[1fr_4.375fr_0.625fr]'
const columnClassNames = ['', '', 'text-right']

function HomeTable({ columns, rows }) {
  return (
    <div className="text-sm">
      <div className={cn('grid gap-x-3 py-2 font-medium text-gray-500', gridClassName)}>
        {columns.map((column, index) => (
          <span key={column} className={columnClassNames[index]}>
            {column}
          </span>
        ))}
      </div>
      <ul className="group/list-wrapper list-none">
        {rows.map((row) => {
          const cells = row.cells.map((cell, index) => (
            <span key={columns[index]} className={columnClassNames[index]}>
              {cell}
            </span>
          ))
          const rowClassName = cn(
            'grid items-center gap-x-3 border-t border-gray-200 py-4 transition-colors duration-300 group-hover/list-item:text-gray-900',
            gridClassName
          )

          return (
            <li key={row.key} className="group/list-item p-0 group-hover/list-wrapper:text-gray-300">
              {row.href ? (
                <a href={row.href} target="_blank" rel="noopener noreferrer" className={rowClassName}>
                  {cells}
                </a>
              ) : (
                <div className={rowClassName}>{cells}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function HomeSection({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  )
}

export function HomeIntroduction() {
  return (
    <>
      <section aria-label="Introduction" className="space-y-5 leading-relaxed text-gray-900">
        <p>
          Hi, I&apos;m Priyanshu Singh, a computer science student at Bennett University and a full-stack developer from
          India. I build for the web, and for everything that runs behind it.
        </p>
        <p>
          Right now that means{' '}
          <a href="https://classvault.in" target="_blank" rel="noopener noreferrer" className={linkClassName}>
            ClassVault
          </a>
          , a home for the notes, past papers and study plans that usually get lost in group chats. Along the way
          I&apos;ve built an AI reviewer for pull requests, a real-time room for pair programming, and an NFT
          marketplace on AWS.
        </p>
        <p>
          I like taking systems apart until I understand why they work. Then I write it up here, usually with a drawing.
        </p>
      </section>

      <HomeSection id="skills-heading" title="Skills">
        <HomeTable
          columns={['Area', 'Tools', '']}
          rows={SKILLS.map((skill) => ({ key: skill.area, cells: [skill.area, skill.tools, null] }))}
        />
      </HomeSection>

      <HomeSection id="projects-heading" title="Projects">
        <HomeTable
          columns={['Project', 'Description', 'Status']}
          rows={PROJECTS.map((project) => ({
            key: project.name,
            href: project.url,
            cells: [
              <span key="name" className="inline-flex items-center gap-1">
                {project.name}
                <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
              </span>,
              project.description,
              project.status
            ]
          }))}
        />
      </HomeSection>
    </>
  )
}
