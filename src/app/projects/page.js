import { CatSticker } from '@/components/cat-sticker'
import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { GithubIcon } from '@/lib/constants'
import { pageMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const metadata = pageMetadata({
  title: 'Projects',
  description:
    'Things I have built: an AI job-fit engine, a study platform, a pull-request reviewer and a privacy CLI.',
  path: '/projects'
})

const STATUS = {
  Live: { label: 'Live', dot: 'bg-emerald-500' },
  Building: { label: 'Building', dot: 'bg-amber-400 motion-safe:animate-pulse' },
  OpenSource: { label: 'Open source', dot: 'bg-zinc-300' }
}

// `url` is where the name links. `repo` adds a GitHub button; leave it out when the
// code is private or when `url` is already the repository.
const PROJECTS = [
  {
    name: 'CallAaya',
    status: 'Live',
    url: 'https://callaaya.fun',
    points: [
      'Built an AI job-fit engine that ranks 22,000+ live job postings by how well your skills fit each role.',
      'Pulls jobs from Greenhouse, Lever, Ashby, Workday and Adzuna on a 6-hour refresh, and publishes 3,000+ SEO job pages.',
      'Drafts a tailored resume for each job and checks every line against your real resume, so nothing is made up.',
      'Sells paid passes through Razorpay, and has paying users.'
    ],
    stack: ['Next.js', 'Turso', 'Claude API', 'Razorpay']
  },
  {
    name: 'ClassVault',
    status: 'Building',
    url: 'https://classvault.in',
    repo: 'https://github.com/404priyanshu/classvault',
    points: [
      'Built a home for college notes, past papers and study roadmaps, with search across note text and PDFs.',
      'Sign-in with email, Google, GitHub or phone OTP, plus university membership and moderated uploads.',
      'Put access control in PostgreSQL row-level security, checked by 260+ pgTAP assertions and Vitest and Playwright tests.',
      'Added realtime study rooms with a synced Pomodoro timer and chat.'
    ],
    stack: ['Next.js', 'Supabase', 'PostgreSQL']
  },
  {
    name: 'Vernier',
    status: 'Live',
    url: 'https://vernier-phi.vercel.app',
    repo: 'https://github.com/404priyanshu/vernier',
    points: [
      'Built an AI reviewer for GitHub pull requests that flags bugs and security vulnerabilities in the diff.',
      'Runs fast heuristic checks first (SQL injection, XSS, unsafe pickle, N+1 queries), then batches the remaining hunks into LLM calls.',
      'Caches model results per diff hunk in Redis, so an unchanged hunk never costs a second model call.',
      'Ships every finding with a suggested fix and a test stub.'
    ],
    stack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Redis']
  },
  {
    name: 'Crumbprint',
    status: 'OpenSource',
    url: 'https://github.com/404priyanshu/crumbprint',
    points: [
      'Built a local-first CLI that audits your own Instagram data export and grades your privacy exposure.',
      'Reads the export in place and never uploads it. Message bodies and follower names appear only as counts.',
      'Scores contact, location, ad-profiling, connected-app and account-security signals with deterministic rules, then hands you a fix checklist.'
    ],
    stack: ['TypeScript', 'Node.js']
  }
]

function Status({ status }) {
  const { label, dot } = STATUS[status]
  return (
    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span className={cn('size-1.5 rounded-full', dot)} aria-hidden="true" />
      {label}
    </span>
  )
}

function ProjectCard({ project }) {
  return (
    <SpotlightCard className="border-zinc-150 rounded-xl border bg-white p-5 shadow-xs transition-colors hover:border-zinc-300">
      <article aria-labelledby={`project-${project.name}`} className="space-y-3">
        <header className="flex items-center gap-3">
          <h2 id={`project-${project.name}`} className="mb-0 text-[15px] font-semibold">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="decoration-zinc-350 inline-flex items-center gap-0.5 text-zinc-900 underline underline-offset-4 hover:decoration-zinc-900"
            >
              {project.name}
              <span className="text-[10px] font-normal text-zinc-400 select-none" aria-hidden="true">
                ↗
              </span>
            </a>
          </h2>
          <Status status={project.status} />
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.name} on GitHub`}
              className="ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <GithubIcon />
            </a>
          )}
        </header>

        <ul className="mb-0 list-disc space-y-1.5 pl-4 text-[13.5px] leading-relaxed text-zinc-500 marker:text-zinc-300">
          {project.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <p className="mb-0 text-xs text-zinc-400">
          <span className="sr-only">Built with </span>
          {project.stack.join(' · ')}
        </p>
      </article>
    </SpotlightCard>
  )
}

export default function ProjectsPage() {
  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Projects" />
      <div className="content-wrapper">
        <div className="content animate-reveal space-y-6">
          <PageTitle title="Projects" />
          <p className="text-[13.5px] leading-relaxed text-zinc-500">
            Things I have built and shipped, from products with paying users to small open-source tools.
          </p>

          {/* pt-8 leaves room for the cat, who sits on the first card's top edge. */}
          <div className="space-y-4 pt-8">
            {PROJECTS.map((project, i) => (
              <div key={project.name} className="relative">
                {i === 0 && <CatSticker size={52} className="absolute -top-[45px] right-4 z-10" />}
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
