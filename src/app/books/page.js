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
    synopsis:
      'An absolute masterclass in visual learning. This book breaks down complex computer science concepts—like recursion, tree traversal, dynamic programming, and search algorithms—into highly intuitive, hand-drawn diagrams and clear explanations. It is an essential resource for any engineer looking to develop a deep, visual intuition for computational complexity and fundamental data structures.'
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
            A curated list of books that have shaped my technical perspective, system-design frameworks, and
            problem-solving methodologies.
          </p>

          <div className="space-y-6">
            {BOOKS.map((book) => (
              <SpotlightCard
                key={book.title}
                className="border-zinc-150 flex flex-col gap-6 rounded-xl border bg-white p-5 shadow-xs transition-all duration-300 hover:border-zinc-300 hover:shadow-sm md:flex-row"
              >
                {/* Visual Mock Book Cover Natively Rendered in CSS */}
                <div
                  className="relative mx-auto flex h-44 w-32 shrink-0 flex-col justify-between overflow-hidden rounded-lg border border-zinc-800 bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-3.5 shadow-md select-none md:mx-0"
                  aria-hidden="true"
                >
                  {/* Left Spine Overlay */}
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 border-r border-zinc-700/30 bg-black/45" />

                  {/* Spine Highlight */}
                  <div className="absolute top-0 bottom-0 left-1.5 w-[1px] bg-white/10" />

                  {/* Geometric Algo Art Grid overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:12px_12px] opacity-15" />

                  {/* Top: Edition & Spine details */}
                  <div className="z-10 text-right font-mono text-[6px] tracking-widest text-zinc-500 uppercase">
                    {book.edition}
                  </div>

                  {/* Center Graphic: Algorithms Node Connection Visual */}
                  <div className="z-10 my-2 flex flex-col items-center justify-center gap-1.5">
                    <span className="text-center font-mono text-[8px] leading-normal font-bold tracking-widest text-zinc-300">
                      GROKKING
                    </span>
                    <span className="text-center font-sans text-[10px] leading-none font-black tracking-tight text-indigo-400 uppercase">
                      ALGORITHMS
                    </span>

                    {/* Visual graph connectivity drawing */}
                    <div className="mt-2 flex w-full items-center justify-center gap-1.5 border-y border-zinc-800/80 py-1.5">
                      <span className="size-1 rounded-full bg-indigo-400" />
                      <div className="h-[1px] w-6 bg-zinc-800" />
                      <span className="size-1 rounded-full bg-zinc-500" />
                      <div className="bg-zinc-850 h-[1px] w-4" />
                      <span className="size-1 rounded-full bg-indigo-500" />
                    </div>
                  </div>

                  {/* Bottom: Author name */}
                  <div className="z-10 text-center font-mono text-[6px] tracking-widest text-zinc-400 uppercase">
                    A. BHARGAVA
                  </div>
                </div>

                {/* Book Details and Synopsis */}
                <div className="flex flex-1 flex-col justify-between space-y-4 py-0.5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                      <h3 className="text-base font-semibold tracking-tight text-zinc-950">
                        {book.title}
                        <span className="ml-2 text-xs font-normal text-zinc-400">({book.edition})</span>
                      </h3>

                      {/* Reading Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold ${book.statusColor}`}
                      >
                        <span className="size-1.5 rounded-full bg-green-500" />
                        {book.status}
                      </span>
                    </div>

                    <p className="font-mono text-xs tracking-wider text-zinc-400">by {book.author}</p>

                    <p className="text-[13px] leading-relaxed text-zinc-600">{book.synopsis}</p>
                  </div>

                  {/* Visual underline dynamic link to buy/details */}
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex w-fit items-center text-xs font-semibold text-zinc-900"
                  >
                    <span className="border-b border-zinc-200 pb-0.5 transition-colors group-hover:border-zinc-900 group-hover:text-black">
                      View details
                    </span>
                    <span className="ml-1 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-black">
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
