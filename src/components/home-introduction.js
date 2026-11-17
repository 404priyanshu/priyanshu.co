import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { CopyEmail } from '@/components/copy-email'
import { CONTACT_EMAIL, CONTACT_MAILTO, PROFILES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const SKILLS = [
  { area: 'Languages', tools: ['TypeScript', 'Python', 'JavaScript'] },
  { area: 'Frameworks', tools: ['React', 'Next.js', 'Node.js', 'NestJS', 'FastAPI'] },
  { area: 'Cloud & data', tools: ['AWS', 'PostgreSQL', 'Redis', 'Terraform'] }
]

// A section opens with a small numbered label over a hairline, like the index of a
// notebook. `action` sits at the right end of the line.
export function SectionHeading({ id, index, action, children }) {
  return (
    <div className="border-zinc-150 mb-1 flex items-baseline justify-between border-b pb-2.5">
      <h2
        id={id}
        className="mb-0 flex items-baseline gap-2.5 font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase"
      >
        <span className="text-zinc-300 tabular-nums">{index}</span>
        {children}
      </h2>
      {action}
    </div>
  )
}

export function SectionLink({ href, children }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1 text-[12.5px] font-medium text-zinc-500 hover:text-zinc-900"
    >
      {children}
      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  )
}

function TextLink({ href, children }) {
  const isExternal = href.startsWith('http')
  return (
    <a
      href={href}
      {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
      className="decoration-zinc-350 font-medium text-zinc-900 underline underline-offset-4 hover:decoration-zinc-900"
    >
      {children}
    </a>
  )
}

// The one flourish: a pen stroke under the name that draws itself once, in the pink of
// the "New" badge (see .pen-underline in globals.css). Decorative.
function PenUnderline({ children }) {
  return (
    <span className="pen-underline">
      {children}
      <svg viewBox="0 0 200 14" fill="none" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path pathLength="1" d="M3 9.5C38 4.5 92 3 140 5.5C164 6.8 184 8.5 197 6.5M24 12C70 9 128 8.6 168 10.2" />
      </svg>
    </span>
  )
}

function OpenToWork() {
  return (
    <a
      href="#contact"
      className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-zinc-500 uppercase hover:text-zinc-900"
    >
      <span className="relative flex size-1.5" aria-hidden="true">
        <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-70 motion-safe:animate-ping" />
        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
      </span>
      Open to work
    </a>
  )
}

export function HomeIntroduction() {
  return (
    <section aria-labelledby="intro-heading" className="flex flex-col items-start gap-5">
      <div className="flex items-center gap-3">
        {/* The sidebar shows the photo on desktop; phones have no sidebar. */}
        <Image
          src="/assets/me.jpg"
          alt=""
          width={40}
          height={40}
          className="size-10 rounded-full border-0 object-cover shadow-[0_0_0_2px_white,0_1px_4px_rgb(0_0_0/0.15)] lg:hidden"
        />
        <OpenToWork />
      </div>

      <h1 id="intro-heading" className="mb-0">
        Hello, I&apos;m <PenUnderline>Priyanshu</PenUnderline>.
      </h1>

      <div className="flex max-w-[62ch] flex-col gap-4 text-[15px] leading-[1.75] text-zinc-500">
        <p className="mb-0">
          <span className="text-zinc-900">A computer science student</span> at Bennett University and a full-stack
          developer from India. I build for the web, and for everything that runs behind it.
        </p>
        <p className="mb-0">
          <span className="text-zinc-900">Right now that means</span>{' '}
          <TextLink href="https://callaaya.fun">CallAaya</TextLink>, which ranks live jobs by how well your skills fit
          and tailors your resume to each one, and <TextLink href="https://classvault.in">ClassVault</TextLink>, a home
          for the notes, past papers and study plans that usually get lost in group chats. Along the way I&apos;ve built
          an AI reviewer for pull requests.
        </p>
        <p className="mb-0">
          <span className="text-zinc-900">I like taking systems apart</span> until I understand why they work. Then I
          write it up here, usually with a drawing.
        </p>
      </div>

      <SectionLink href="/projects">See what I&apos;ve built</SectionLink>
    </section>
  )
}

export function HomeSkills() {
  return (
    <section aria-labelledby="skills-heading">
      <SectionHeading id="skills-heading" index="02">
        Skills
      </SectionHeading>
      <dl className="mb-0 divide-y divide-zinc-100 text-sm">
        {SKILLS.map((skill) => (
          <div key={skill.area} className="grid gap-1 py-3.5 md:grid-cols-[10rem_1fr] md:gap-4">
            <dt className="text-zinc-500">{skill.area}</dt>
            <dd className="m-0 text-zinc-900">{skill.tools.join(' · ')}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function ContactLink({ href, children, primary }) {
  const isEmail = href.startsWith('mailto:')
  return (
    <a
      href={href}
      {...(!isEmail && { target: '_blank', rel: 'noopener noreferrer' })}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
        primary
          ? 'bg-zinc-900 text-white hover:bg-zinc-700'
          : 'border-zinc-150 border bg-white text-zinc-700 shadow-xs hover:border-zinc-300 hover:text-zinc-900'
      )}
    >
      {children}
      {!isEmail && (
        <span className="text-[10px] font-normal text-zinc-400 select-none" aria-hidden="true">
          ↗
        </span>
      )}
    </a>
  )
}

// The closing section: the same ask as the intro, for whoever reads to the end.
export function HomeClosing() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-24">
      <SectionHeading id="contact-heading" index="03">
        Contact
      </SectionHeading>
      <div className="flex flex-col items-start gap-4 pt-3">
        <p className="mb-0 max-w-[62ch] text-[15px] leading-[1.75] text-zinc-500">
          <span className="text-zinc-900">Let&apos;s work together.</span> I&apos;m looking for a full-stack or backend
          role: full-time or internship, remote or in India.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <ContactLink href={CONTACT_MAILTO} primary>
            Get in touch
          </ContactLink>
          <ContactLink href={PROFILES.linkedin.url}>LinkedIn</ContactLink>
          <ContactLink href={PROFILES.github.url}>GitHub</ContactLink>
          <CopyEmail email={CONTACT_EMAIL} className="ml-1 text-zinc-500" />
        </div>
      </div>
    </section>
  )
}
