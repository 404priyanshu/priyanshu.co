import { ArrowUpRight, Cloud, FingerprintPattern, GitPullRequest, Search } from 'lucide-react'

import { GrowOnView } from '@/components/grow-on-view'
import { HomeCard, iconTileClassName, LiveSpinner, rise } from '@/components/home-card'
import { cn } from '@/lib/utils'

const STATUS = {
  Live: { label: 'Live', dot: 'bg-emerald-500' },
  Building: { label: 'Building', dot: 'bg-amber-400 motion-safe:animate-pulse' },
  GitHub: { label: 'Open source', dot: 'bg-gray-300' }
}

// Icons match the chips in the introduction, so a project looks the same in both places.
const ICON = { size: 16, strokeWidth: 1.75 }

const FEATURED = {
  name: 'ClassVault',
  description: 'Notes, past papers and study roadmaps for college students, in one place.',
  status: 'Building',
  url: 'https://classvault.in',
  label: 'Visit classvault.in'
}

const PROJECTS = [
  {
    name: 'Vernier',
    description: 'AI review for pull requests that flags bugs and security vulnerabilities.',
    status: 'Live',
    url: 'https://vernier-phi.vercel.app',
    icon: <GitPullRequest {...ICON} />
  },
  {
    name: 'BlockForge',
    description: 'NFT marketplace with escrow contracts, its own chain indexer, and AWS infrastructure.',
    status: 'GitHub',
    url: 'https://github.com/404priyanshu/BlockForgeNFT',
    icon: <Cloud {...ICON} className="fill-gray-600 text-gray-600" />
  },
  {
    name: 'CodeDuel',
    description: 'Shared code editor with real-time sync, for interviews and pair programming.',
    status: 'GitHub',
    url: 'https://github.com/404priyanshu/codeduel',
    icon: <LiveSpinner className="size-3.5" />
  },
  {
    name: 'Crumbprint',
    description: 'Local-first CLI that audits your Instagram data export for privacy risks.',
    status: 'GitHub',
    url: 'https://github.com/404priyanshu/crumbprint',
    icon: <FingerprintPattern {...ICON} />
  }
]

function StatusLabel({ status, className }) {
  const { label, dot } = STATUS[status]
  return (
    <span className={cn('flex items-center gap-2 text-xs text-gray-500', className)}>
      <span className={cn('size-1.5 rounded-full', dot)} aria-hidden="true" />
      {label}
    </span>
  )
}

// The whole card is the link. A pink-to-blue rim fades in behind it on hover.
function ProjectLink({ href, className, index, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={rise(index)}
      className={cn('group rise-in relative block rounded-[26px] p-px', className)}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-[26px] bg-linear-to-br from-fuchsia-300 via-sky-300 to-emerald-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </a>
  )
}

function ProjectText({ project, large }) {
  return (
    <p className={cn('mb-0 leading-snug text-gray-500', large ? 'text-base md:text-lg' : 'text-[15px]')}>
      <span className="font-medium text-gray-900">{project.name}.</span> {project.description}
    </p>
  )
}

// A small, quiet mock of ClassVault: a search bar over two note cards, in a window
// that bleeds off the card's right and bottom edges. Decorative; the text says what it is.
function ClassVaultPreview() {
  const motionClassName = 'transition-transform duration-500 ease-out motion-reduce:transition-none'

  return (
    <div aria-hidden="true" className="relative h-52 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-1/2">
      <div className="absolute top-4 right-0 bottom-0 left-4 space-y-2.5 rounded-tl-2xl bg-gray-50 [mask-image:linear-gradient(to_bottom,#000_65%,transparent)] p-4 ring-1 ring-black/[0.05] sm:top-7 sm:left-0">
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs text-gray-400 shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-black/[0.06]">
          <Search size={12} strokeWidth={2} />
          Search notes and past papers
          <span className="ml-auto rounded border border-gray-200 px-1 font-mono text-[10px] leading-4">/</span>
        </div>
        <NoteCard
          tag="Past paper"
          tagClassName="bg-[#fdeadf] text-[#9a4a1c]"
          meta="2024"
          title="DBMS · End-term"
          className={cn(motionClassName, 'group-hover:-translate-y-0.5')}
        />
        <NoteCard
          tag="Notes"
          tagClassName="bg-[#dff0e3] text-[#2f6b45]"
          meta="Unit 3"
          title="Operating Systems"
          className={cn(motionClassName, 'ml-6 group-hover:-translate-x-1.5')}
        />
      </div>
    </div>
  )
}

function NoteCard({ tag, tagClassName, meta, title, className }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_6px_16px_-8px_rgb(0_0_0/0.1)] ring-1 ring-black/[0.05]',
        className
      )}
    >
      <div className="flex items-center justify-between text-[10px]">
        <span className={cn('rounded-full px-1.5 py-0.5 font-medium', tagClassName)}>{tag}</span>
        <span className="text-gray-400">{meta}</span>
      </div>
      <p className="mt-2 mb-2 text-[13px] leading-tight font-medium text-gray-800">{title}</p>
      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full bg-gray-100" />
        <div className="h-1.5 w-2/3 rounded-full bg-gray-100" />
      </div>
    </div>
  )
}

// Text on the left, a small product preview on the right.
function FeaturedProject() {
  return (
    <GrowOnView className="sm:col-span-2">
      <ProjectLink href={FEATURED.url} index={3}>
        <HomeCard
          className="relative h-full shadow-none"
          innerClassName="relative flex h-full flex-col overflow-hidden bg-white p-0 sm:min-h-[248px]"
        >
          <ClassVaultPreview />
          <div className="relative flex flex-1 flex-col gap-3 p-4 sm:w-1/2 sm:p-6">
            <StatusLabel status={FEATURED.status} />
            <ProjectText project={FEATURED} large />
            <span className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-gray-100 py-1.5 pr-2.5 pl-3 text-xs font-medium text-gray-600 transition-colors group-hover:bg-gray-900 group-hover:text-white sm:mt-6">
              {FEATURED.label}
              <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
            </span>
          </div>
        </HomeCard>
      </ProjectLink>
    </GrowOnView>
  )
}

function ProjectCard({ project, index }) {
  return (
    <ProjectLink href={project.url} index={index}>
      <HomeCard className="relative h-full shadow-none" innerClassName="flex h-full flex-col gap-4 bg-white p-4">
        <div className="flex items-center justify-between">
          <span aria-hidden="true" className={cn('inline-flex size-9 rounded-xl', iconTileClassName)}>
            {project.icon}
          </span>
          {/* The status rests here; on hover it gives way to the arrow. */}
          <span className="relative flex items-center">
            <StatusLabel status={project.status} className="transition-opacity duration-300 group-hover:opacity-0" />
            <span
              aria-hidden="true"
              className="absolute right-0 inline-flex size-7 -translate-x-1 items-center justify-center rounded-full bg-gray-900 text-white opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            >
              <ArrowUpRight size={14} strokeWidth={1.75} />
            </span>
          </span>
        </div>
        <ProjectText project={project} />
      </HomeCard>
    </ProjectLink>
  )
}

export function HomeProjects() {
  return (
    <section aria-labelledby="projects-heading" className="space-y-4">
      <h2 id="projects-heading" style={rise(2)} className="rise-in px-1">
        Projects
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <FeaturedProject />
        {PROJECTS.map((project, i) => (
          <ProjectCard key={project.name} project={project} index={4 + i} />
        ))}
      </div>
    </section>
  )
}
