import { ArrowRight, Code, Cpu, Sparkles, Terminal } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { Button } from '@/components/ui/button'
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
        <div className="content space-y-12 animate-reveal">
          
          {/* Main Title Section */}
          <PageTitle title="Home" className="lg:hidden" />
          
          {/* Hero Welcome */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-150 bg-zinc-50/50 px-3 py-1 text-xs text-zinc-500 font-mono">
              <Sparkles size={12} className="text-zinc-400" />
              <span>Software Engineer & Indie Developer</span>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              Hi, I'm Priyanshu Singh.
            </h1>
            
            <p className="max-w-[65ch] text-[15px] leading-relaxed text-zinc-600 font-normal">
              I am a software engineer and indie developer who loves to explore new technologies, deep-dive into complex systems, and build scalable digital products, based in India.
            </p>
          </div>

          {/* Dynamic Active Status Board (Pulsing glowing element) */}
          <SpotlightCard className="rounded-xl border border-zinc-150 bg-zinc-50/40 p-5 space-y-3 relative overflow-hidden group shadow-xs">
            {/* Ambient background glow */}
            <div className="absolute right-0 top-0 -mr-6 -mt-6 size-24 bg-green-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-green-500/10 transition-colors" />
            
            <div className="flex items-center gap-2">
              {/* Pulsing Green Circle element */}
              <span className="relative flex size-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-green-500" />
              </span>
              <span className="text-[10px] font-mono font-semibold tracking-widest text-zinc-400 uppercase select-none">
                Focus & Status
              </span>
            </div>
            
            <p className="text-[13px] text-zinc-600 leading-relaxed font-normal">
              Currently focusing on building robust backend systems, mastering AWS Cloud architecture, and practicing Data Structures & Algorithms (DSA) using Python.
            </p>
          </SpotlightCard>

          {/* Capabilities Grid */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-semibold tracking-widest text-zinc-400 uppercase select-none">
              Expertise & Foundations
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SpotlightCard className="rounded-xl border border-zinc-150 p-4 space-y-2 hover:border-zinc-300 transition-colors bg-white">
                <div className="flex items-center gap-2 text-zinc-800">
                  <Code size={15} className="text-zinc-500" />
                  <h3 className="font-semibold text-sm tracking-tight">Backend & AWS Cloud</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Designing scalable server architectures, constructing robust APIs, and deploying secure, resilient cloud networks using AWS.
                </p>
              </SpotlightCard>

              <SpotlightCard className="rounded-xl border border-zinc-150 p-4 space-y-2 hover:border-zinc-300 transition-colors bg-white">
                <div className="flex items-center gap-2 text-zinc-800">
                  <Cpu size={15} className="text-zinc-500" />
                  <h3 className="font-semibold text-sm tracking-tight">Algorithms & Logic</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Deep-diving into computational problem-solving, data structures, and optimizing algorithmic performance using Python.
                </p>
              </SpotlightCard>
            </div>
          </div>

          {/* Interactive Tool Chips Showcase */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-semibold tracking-widest text-zinc-400 uppercase select-none">
              Primary Toolkit
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono select-none">
              {['Python', 'AWS', 'Node.js', 'React', 'Next.js', 'Docker', 'PostgreSQL', 'Tailwind CSS'].map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-1 rounded-md border border-zinc-150 bg-zinc-50/50 hover:bg-zinc-100/80 hover:border-zinc-300 hover:-translate-y-0.5 hover:text-black transition-all cursor-default text-zinc-600 font-medium"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Writing Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-zinc-400 uppercase select-none">
                Latest Publications
              </span>
              <Link 
                href="/writing" 
                className="group inline-flex items-center gap-1 text-xs font-mono font-semibold text-zinc-500 hover:text-zinc-950 transition-colors"
              >
                All posts
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
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
