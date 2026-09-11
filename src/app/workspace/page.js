import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { WORKSPACE_ITEMS } from '@/lib/constants'

export const metadata = {
  title: 'Workspace',
  description: 'My daily coding workspace gear, developer environment, and hardware setup.'
}

export default function WorkspacePage() {
  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Workspace" />
      <div className="content-wrapper">
        <div className="content animate-reveal space-y-6">
          <PageTitle title="Workspace" />

          {/* Main workspace featured image (Silver MacBook Air M1 open on a clean desk) */}
          <div className="space-y-2 select-none">
            <img
              src="/assets/macbook_air_m1.png"
              alt="Silver MacBook Air M1 open on a clean wooden desk setup"
              className="border-zinc-150 max-h-[460px] w-full rounded-xl border object-cover shadow-sm"
              loading="lazy"
            />
            <div className="py-1 text-center font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
              Workspace
            </div>
          </div>

          {/* Structured Product Specs Table */}
          <SpotlightCard className="border-zinc-150 mt-8 overflow-x-auto rounded-lg border bg-white shadow-xs select-none">
            <table className="w-full border-collapse text-left text-[12.5px]">
              <thead>
                <tr className="border-zinc-150 border-b bg-zinc-50/70 font-mono text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Specs</th>
                  <th className="px-4 py-3 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {WORKSPACE_ITEMS.map((item) => {
                  const isLocalBlog = item.url?.startsWith('/')
                  const linkLabel = isLocalBlog ? 'Read' : 'Buy'

                  return (
                    <tr key={item.title} className="transition-colors hover:bg-zinc-50/50">
                      <td className="px-4 py-3 font-semibold text-zinc-950">{item.title}</td>
                      <td className="px-4 py-3 font-medium text-zinc-500">{item.specs}</td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={item.url}
                          target={isLocalBlog ? undefined : '_blank'}
                          rel={isLocalBlog ? undefined : 'noopener noreferrer'}
                          className="inline-flex items-center gap-0.5 font-semibold text-blue-600 hover:underline"
                        >
                          {linkLabel}
                          <span className="text-[9px] font-normal no-underline select-none">↗</span>
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </SpotlightCard>
        </div>
      </div>
    </ScrollArea>
  )
}
