import { ArrowUpRight, BookOpen, Cloud, GitPullRequest, Mail, PenLine } from 'lucide-react'
import Image from 'next/image'

import { CopyEmail } from '@/components/copy-email'
import { Highlight, HomeCard, InlineChip, LiveSpinner, rise } from '@/components/home-card'
import { CONTACT_EMAIL, CONTACT_MAILTO, PROFILES } from '@/lib/constants'
import { cn } from '@/lib/utils'

// One pastel tint per area, from the same family as the highlighter marks.
const SKILLS = [
  {
    area: 'Languages',
    tools: ['TypeScript', 'Python', 'JavaScript'],
    dot: 'bg-[#e8794a]',
    chip: 'bg-[#fdeadf] text-[#9a4a1c] ring-[#f6d5c2]'
  },
  {
    area: 'Frameworks',
    tools: ['React', 'Next.js', 'Node.js', 'NestJS', 'FastAPI'],
    dot: 'bg-[#e0b92c]',
    chip: 'bg-[#fbf1bf] text-[#7a6210] ring-[#efe0a0]'
  },
  {
    area: 'Cloud & data',
    tools: ['AWS', 'PostgreSQL', 'Redis', 'Terraform'],
    dot: 'bg-[#5fae78]',
    chip: 'bg-[#dff0e3] text-[#2f6b45] ring-[#c7e2cd]'
  }
]

const ICON = { size: 14, strokeWidth: 1.75 }

function Greeting() {
  // mb-5 replaces the page's 40px gap so the greeting sits with its card. The pill is
  // inline-block so its baseline is the text's, and baseline alignment keeps "Hello",
  // "there" and the comma on one line of type.
  return (
    <h1
      style={rise(0)}
      className="rise-in mb-5 flex items-baseline gap-2.5 text-3xl font-medium tracking-tight text-gray-900 md:text-4xl"
    >
      Hello
      <span className="inline-block rounded-full border-[1.5px] border-dashed border-[#9cc3a4] bg-[#3f7a4e]/[0.04] px-3 py-1.5 leading-none text-[#3f7a4e]">
        <span className="mr-1.5 inline-block size-1.5 rounded-full bg-[#3f7a4e] align-middle" aria-hidden="true" />
        there
      </span>
      <span className="-ml-2">,</span>
    </h1>
  )
}

// A live green dot that pings softly, in the greeting's green.
function OpenToWork() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#e6f1e8] py-1 pr-3 pl-2.5 text-xs leading-5 font-medium text-[#2f6b45] ring-1 ring-[#cfe3d3]">
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex size-full rounded-full bg-[#4f9a63] opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex size-2 rounded-full bg-[#3f8a55]" />
      </span>
      Open to work
    </span>
  )
}

function ContactLink({ href, children, secondary }) {
  const isEmail = href.startsWith('mailto:')
  const Icon = isEmail ? Mail : ArrowUpRight

  return (
    <a
      href={href}
      {...(!isEmail && { target: '_blank', rel: 'noopener noreferrer' })}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full py-2 pr-3 pl-4 text-sm font-medium transition-colors',
        secondary
          ? 'bg-white text-gray-700 shadow-[0_1px_2px_rgb(0_0_0/0.05)] ring-1 ring-black/[0.06] hover:text-gray-900'
          : 'bg-gray-900 text-white hover:bg-gray-700'
      )}
    >
      {children}
      <Icon size={14} strokeWidth={2} aria-hidden="true" />
    </a>
  )
}

function HireStrip() {
  return (
    <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-black/[0.04] sm:flex-row sm:items-center sm:justify-between">
      <p className="mb-0 text-[15px] leading-snug">
        <span className="font-medium text-gray-900">I&apos;m looking for a full-stack or backend role.</span> Full-time
        or internship, remote or in India.
      </p>
      <ContactLink href={CONTACT_MAILTO}>Get in touch</ContactLink>
    </div>
  )
}

export function HomeIntroduction() {
  return (
    <>
      <Greeting />

      {/* Each icon stays on the line of the word before it, with its punctuation. */}
      <HomeCard
        style={rise(1)}
        className="rise-in"
        innerClassName="p-6 text-[15px] leading-[1.8] text-gray-500 md:text-base"
      >
        <section aria-label="Introduction">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <p className="mb-0 flex items-center gap-2.5 text-gray-900">
              <Image
                src="/assets/me.jpg"
                alt=""
                width={28}
                height={28}
                className="size-7 rounded-full border-0 object-cover shadow-[0_0_0_2px_white,0_2px_6px_rgb(0_0_0/0.15)]"
              />
              <span className="font-medium">Priyanshu Singh</span>
            </p>
            <OpenToWork />
          </div>
          <p className="mb-4">
            <span className="font-medium text-gray-900">A computer science student</span> at Bennett University and a
            full-stack developer from India. I build for the web, and for everything that runs behind it.
          </p>
          <p className="mb-4">
            <span className="font-medium text-gray-900">Right now that means</span>{' '}
            <span className="whitespace-nowrap">
              <a href="https://classvault.in" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
                <Highlight delay={400} color="#ffd6c2">
                  ClassVault
                </Highlight>
              </a>
              <InlineChip>
                <BookOpen {...ICON} />
              </InlineChip>
              ,
            </span>{' '}
            a home for the notes, past papers and study plans that usually get lost in group chats. Along the way
            I&apos;ve built an{' '}
            <span className="whitespace-nowrap">
              <Highlight delay={700}>AI reviewer for pull requests</Highlight>
              <InlineChip>
                <GitPullRequest {...ICON} />
              </InlineChip>
              ,
            </span>{' '}
            a real-time room for pair{' '}
            <span className="whitespace-nowrap">
              programming
              <InlineChip>
                <LiveSpinner />
              </InlineChip>
              ,
            </span>{' '}
            and an NFT marketplace on{' '}
            <span className="whitespace-nowrap">
              AWS
              <InlineChip>
                <Cloud {...ICON} className="fill-gray-600 text-gray-600" />
              </InlineChip>
              .
            </span>
          </p>
          <p className="mb-0">
            <span className="font-medium text-gray-900">I like taking systems apart</span> until I understand why they
            work. Then I write it up here,{' '}
            <span className="whitespace-nowrap">
              <Highlight delay={1000}>usually with a drawing</Highlight>
              <InlineChip>
                <PenLine {...ICON} />
              </InlineChip>
            </span>
          </p>
          <HireStrip />
        </section>
      </HomeCard>
    </>
  )
}

export function HomeSkills() {
  return (
    <HomeCard style={rise(8)} className="rise-in">
      <section aria-labelledby="skills-heading">
        <h2 id="skills-heading" className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-gray-400 uppercase">
          Skills
        </h2>
        <div className="space-y-3">
          {SKILLS.map((skill) => (
            <div key={skill.area} className="grid gap-2 text-sm md:grid-cols-[8rem_1fr] md:items-center">
              <span className="flex items-center gap-2 text-gray-500">
                <span className={cn('size-1.5 rounded-full', skill.dot)} aria-hidden="true" />
                {skill.area}
              </span>
              <ul className="flex list-none flex-wrap gap-1.5">
                {skill.tools.map((tool) => (
                  <li key={tool} className={cn('rounded-full px-2.5 py-1 text-[13px] ring-1', skill.chip)}>
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </HomeCard>
  )
}

// The closing card: the same ask as the intro, for whoever reads to the end.
export function HomeClosing() {
  return (
    <HomeCard
      style={rise(10)}
      className="rise-in"
      innerClassName="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <section aria-labelledby="closing-heading" className="space-y-3">
        <OpenToWork />
        <h2 id="closing-heading" className="mb-0 text-xl md:text-2xl">
          Still here? Let&apos;s talk.
        </h2>
        <p className="mb-0 max-w-md text-[15px] leading-snug text-gray-500">
          I&apos;m open to full-stack and backend roles, full-time or internship, remote or in India.
        </p>
      </section>
      <div className="flex shrink-0 flex-col items-start gap-2.5 sm:items-end">
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <ContactLink href={CONTACT_MAILTO}>Get in touch</ContactLink>
          <ContactLink href={PROFILES.linkedin.url} secondary>
            LinkedIn
          </ContactLink>
          <ContactLink href={PROFILES.github.url} secondary>
            GitHub
          </ContactLink>
        </div>
        <CopyEmail email={CONTACT_EMAIL} />
      </div>
    </HomeCard>
  )
}
