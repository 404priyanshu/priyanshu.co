import { ArrowRight, Code, Cpu, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { WritingList } from '@/components/writing-list'
import { getAllPosts } from '@/lib/markdown'
import { getItemsByYear, getSortedPosts } from '@/lib/utils'

async function fetchData() {
  const allPosts = await getAllPosts()
  const sortedPosts = getSortedPosts(allPosts)
  const items = getItemsByYear(sortedPosts)
  return { items }
}

export default async function Home() {
  const { items } = await fetchData()

  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Priyanshu Singh" />
      <div className="content-wrapper">
        <div className="content animate-reveal space-y-12">
          {/* Main Title Section */}
          <PageTitle title="Home" className="lg:hidden" />

          {/* Hero Welcome */}
          <div className="space-y-4">
            <div className="border-zinc-150 inline-flex items-center gap-2 rounded-full border bg-zinc-50/50 px-3 py-1 font-mono text-xs text-zinc-500">
              <Sparkles size={12} className="text-zinc-400" />
              <span>Software Engineer & Indie Developer</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">Hi, I'm Priyanshu Singh.</h1>

            <p className="max-w-[65ch] text-[15px] leading-relaxed font-normal text-zinc-600">
              I am a software engineer and indie developer who loves to explore new technologies, deep-dive into complex
              systems, and build scalable digital products, based in India.
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="space-y-4">
            <span className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400 uppercase select-none">
              Expertise & Foundations
            </span>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SpotlightCard className="border-zinc-150 space-y-2 rounded-xl border bg-white p-4 transition-colors hover:border-zinc-300">
                <div className="flex items-center gap-2 text-zinc-800">
                  <Code size={15} className="text-zinc-500" />
                  <h3 className="text-sm font-semibold tracking-tight">Backend & AWS Cloud</h3>
                </div>
                <p className="text-xs leading-relaxed text-zinc-500">
                  Designing scalable server architectures, constructing robust APIs, and deploying secure, resilient
                  cloud networks using AWS.
                </p>
              </SpotlightCard>

              <SpotlightCard className="border-zinc-150 space-y-2 rounded-xl border bg-white p-4 transition-colors hover:border-zinc-300">
                <div className="flex items-center gap-2 text-zinc-800">
                  <Cpu size={15} className="text-zinc-500" />
                  <h3 className="text-sm font-semibold tracking-tight">Algorithms & Logic</h3>
                </div>
                <p className="text-xs leading-relaxed text-zinc-500">
                  Deep-diving into computational problem-solving, data structures, and optimizing algorithmic
                  performance using Python.
                </p>
              </SpotlightCard>
            </div>
          </div>

          {/* Interactive Tool Chips Showcase */}
          <div className="space-y-3">
            <span className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400 uppercase select-none">
              Primary Toolkit
            </span>
            <div className="flex flex-wrap gap-2 font-mono text-xs select-none">
              {['Python', 'AWS', 'Node.js', 'React', 'Next.js', 'Docker', 'PostgreSQL', 'Tailwind CSS'].map((tool) => (
                <span
                  key={tool}
                  className="border-zinc-150 cursor-default rounded-md border bg-zinc-50/50 px-2.5 py-1 font-medium text-zinc-600 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-100/80 hover:text-black"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Writing Section */}
          <div className="space-y-4 border-t border-zinc-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400 uppercase select-none">
                Latest Publications
              </span>
              <Link
                href="/writing"
                className="group inline-flex items-center gap-1 font-mono text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-950"
              >
                All posts
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <Suspense fallback={<ScreenLoadingSpinner />}>
              <WritingList items={items} />
            </Suspense>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
