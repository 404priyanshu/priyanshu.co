import { ArrowUpRight, Cloud, FingerprintPattern, GitPullRequest } from 'lucide-react'
import Image from 'next/image'

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

// Text on the left, the whole drawing on the right. The pencil sketch is multiplied into
// the card so its paper-white disappears, the art fades out to the left and bottom
// (.fade-art in globals.css), and on hover it crossfades into the color dithered version.
function FeaturedProject() {
  const artClassName =
    'border-0 object-contain object-bottom transition-[opacity,scale] duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100'

  return (
    <ProjectLink href={FEATURED.url} index={3} className="sm:col-span-2">
      <HomeCard
        className="relative h-full shadow-none"
        innerClassName="relative flex h-full flex-col overflow-hidden bg-white p-0 sm:min-h-[260px]"
      >
        <div className="fade-art relative h-56 sm:absolute sm:top-2 sm:-right-4 sm:-bottom-10 sm:h-auto sm:w-[55%]">
          <Image
            src="/assets/classvault-paper-archive.avif"
            alt=""
            fill
            sizes="(min-width: 435px) 400px, 100vw"
            className={cn(artClassName, 'mix-blend-multiply group-hover:opacity-0')}
          />
          <Image
            src="/assets/classvault-paper-archive-color-dithered.avif"
            alt=""
            fill
            sizes="(min-width: 435px) 400px, 100vw"
            className={cn(artClassName, 'opacity-0 group-hover:opacity-100')}
          />
        </div>
        <div className="relative flex flex-1 flex-col gap-3 p-4 sm:w-[52%] sm:p-6">
          <StatusLabel status={FEATURED.status} />
          <ProjectText project={FEATURED} large />
          <span className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-gray-100 py-1.5 pr-2.5 pl-3 text-xs font-medium text-gray-600 transition-colors group-hover:bg-gray-900 group-hover:text-white sm:mt-6">
            {FEATURED.label}
            <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
          </span>
        </div>
      </HomeCard>
    </ProjectLink>
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
