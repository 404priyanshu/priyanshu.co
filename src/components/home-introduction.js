import { ArrowUpRight, BookOpen, Cloud, GitPullRequest, PenLine } from 'lucide-react'
import Image from 'next/image'

import { Highlight, HomeCard, InlineChip, LiveSpinner } from '@/components/home-card'
import { PROFILES } from '@/lib/constants'

const SKILLS = [
  { area: 'Languages', tools: ['TypeScript', 'Python', 'JavaScript'] },
  { area: 'Frameworks', tools: ['React', 'Next.js', 'Node.js', 'NestJS', 'FastAPI'] },
  { area: 'Cloud & data', tools: ['AWS', 'PostgreSQL', 'Redis', 'Terraform'] }
]

const ICON = { size: 14, strokeWidth: 1.75 }

function Greeting() {
  return (
    <p className="mb-0 flex items-center gap-2 text-3xl font-medium tracking-tight text-gray-900 md:text-4xl">
      Hello
      <span className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-dashed border-[#9cc3a4] px-4 py-2 leading-none text-[#3f7a4e]">
        <span className="size-1.5 rounded-full bg-[#3f7a4e]" aria-hidden="true" />
        there
      </span>
      <span className="-ml-1.5">,</span>
    </p>
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

function HireStrip() {
  return (
    <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-black/[0.04] sm:flex-row sm:items-center sm:justify-between">
      <p className="mb-0 text-[15px] leading-snug">
        <span className="font-medium text-gray-900">I&apos;m looking for my next role.</span> If your team builds for
        the web, I&apos;d love to hear from you.
      </p>
      <a
        href={PROFILES.linkedin.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-full bg-gray-900 py-2 pr-3 pl-4 text-sm font-medium text-white transition-colors hover:bg-gray-700 sm:self-auto"
      >
        Get in touch
        <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
      </a>
    </div>
  )
}

export function HomeIntroduction() {
  return (
    <>
      <Greeting />

      {/* Each icon stays on the line of the word before it, with its punctuation. */}
      <HomeCard innerClassName="p-6 text-[15px] leading-[1.8] text-gray-500 md:text-base">
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
    <HomeCard>
      <section aria-labelledby="skills-heading">
        <h2 id="skills-heading" className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-gray-400 uppercase">
          Skills
        </h2>
        <div className="space-y-3">
          {SKILLS.map((skill) => (
            <div key={skill.area} className="grid gap-2 text-sm md:grid-cols-[8rem_1fr] md:items-center">
              <span className="text-gray-500">{skill.area}</span>
              <ul className="flex list-none flex-wrap gap-1.5">
                {skill.tools.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-full bg-white px-2.5 py-1 text-[13px] text-gray-700 shadow-[0_1px_2px_rgb(0_0_0/0.05)] ring-1 ring-black/[0.05]"
                  >
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
