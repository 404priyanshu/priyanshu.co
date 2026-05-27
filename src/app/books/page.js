import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import { SpotlightCard } from '@/components/ui/spotlight-card'

export const metadata = {
  title: 'Books',
  description: 'A curated list of books that have shaped my technical thinking and problem-solving.'
}

const BOOKS = [
  {
    title: 'Grokking Algorithms',
    edition: 'Second Edition',
    author: 'Aditya Bhargava',
    status: 'Completed',
    statusColor: 'bg-green-500/10 text-green-600 border-green-500/20',
    link: 'https://www.manning.com/books/grokking-algorithms-second-edition',
    synopsis: 'An absolute masterclass in visual learning. This book breaks down complex computer science concepts—like recursion, tree traversal, dynamic programming, and search algorithms—into highly intuitive, hand-drawn diagrams and clear explanations. It is an essential resource for any engineer looking to develop a deep, visual intuition for computational complexity and fundamental data structures.'
  }
]

export default function BooksPage() {
  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Books" />
      <div className="content-wrapper">
        <div className="content">
          <PageTitle title="Books" />
          <p className="mb-10 text-zinc-500">
            A curated list of books that have shaped my technical perspective, system-design frameworks, and problem-solving methodologies.
          </p>

          <div className="space-y-6">
            {BOOKS.map((book) => (
              <SpotlightCard
                key={book.title}
                className="flex flex-col md:flex-row gap-6 p-5 rounded-xl border border-zinc-150 bg-white shadow-xs transition-all duration-300 hover:border-zinc-300 hover:shadow-sm"
              >
                {/* Visual Mock Book Cover Natively Rendered in CSS */}
                <div 
                  className="w-32 h-44 shrink-0 rounded-lg bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-3.5 flex flex-col justify-between border border-zinc-800 shadow-md select-none relative overflow-hidden mx-auto md:mx-0"
                  aria-hidden="true"
                >
                  {/* Left Spine Overlay */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/45 border-r border-zinc-700/30" />
                  
                  {/* Spine Highlight */}
                  <div className="absolute left-1.5 top-0 bottom-0 w-[1px] bg-white/10" />

                  {/* Geometric Algo Art Grid overlay */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:12px_12px]" />

                  {/* Top: Edition & Spine details */}
                  <div className="z-10 text-[6px] font-mono text-zinc-500 uppercase tracking-widest text-right">
                    {book.edition}
                  </div>

                  {/* Center Graphic: Algorithms Node Connection Visual */}
                  <div className="z-10 flex flex-col items-center justify-center my-2 gap-1.5">
                    <span className="font-mono font-bold text-[8px] text-zinc-300 text-center tracking-widest leading-normal">
                      GROKKING
                    </span>
                    <span className="font-sans font-black text-[10px] text-indigo-400 text-center tracking-tight leading-none uppercase">
                      ALGORITHMS
                    </span>
                    
                    {/* Visual graph connectivity drawing */}
                    <div className="flex items-center justify-center gap-1.5 mt-2 py-1.5 border-y border-zinc-800/80 w-full">
                      <span className="size-1 rounded-full bg-indigo-400" />
                      <div className="h-[1px] w-6 bg-zinc-800" />
                      <span className="size-1 rounded-full bg-zinc-500" />
                      <div className="h-[1px] w-4 bg-zinc-850" />
                      <span className="size-1 rounded-full bg-indigo-500" />
                    </div>
                  </div>

                  {/* Bottom: Author name */}
                  <div className="z-10 text-center font-mono text-[6px] text-zinc-400 uppercase tracking-widest">
                    A. BHARGAVA
                  </div>
                </div>

                {/* Book Details and Synopsis */}
                <div className="flex flex-col flex-1 justify-between py-0.5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                      <h3 className="font-semibold text-base text-zinc-950 tracking-tight">
                        {book.title}
                        <span className="font-normal text-xs text-zinc-400 ml-2">
                          ({book.edition})
                        </span>
                      </h3>
                      
                      {/* Reading Status Badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono border ${book.statusColor}`}>
                        <span className="size-1.5 rounded-full bg-green-500" />
                        {book.status}
                      </span>
                    </div>
                    
                    <p className="text-xs text-zinc-400 font-mono tracking-wider">
                      by {book.author}
                    </p>
                    
                    <p className="text-zinc-600 text-[13px] leading-relaxed">
                      {book.synopsis}
                    </p>
                  </div>

                  {/* Visual underline dynamic link to buy/details */}
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center text-xs font-semibold text-zinc-900 w-fit"
                  >
                    <span className="pb-0.5 border-b border-zinc-200 transition-colors group-hover:border-zinc-900 group-hover:text-black">
                      View details
                    </span>
                    <span className="ml-1 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-black transition-transform">
                      &rarr;
                    </span>
                  </a>
                </div>

              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
