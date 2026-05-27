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
        <div className="content space-y-6 animate-reveal">
          <PageTitle title="Workspace" />
          
          {/* Main workspace featured image (Silver MacBook Air M1 open on a clean desk) */}
          <div className="space-y-2 select-none">
            <img
              src="/assets/macbook_air_m1.png"
              alt="Silver MacBook Air M1 open on a clean wooden desk setup"
              className="rounded-xl border border-zinc-150 shadow-sm w-full max-h-[460px] object-cover"
              loading="lazy"
            />
            <div className="text-center text-[10px] font-mono text-zinc-400 uppercase tracking-widest py-1">
              Workspace
            </div>
          </div>

          {/* Structured Product Specs Table */}
          <SpotlightCard className="overflow-x-auto rounded-lg border border-zinc-150 bg-white shadow-xs mt-8 select-none">
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-zinc-150 bg-zinc-50/70 text-zinc-500 font-semibold font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Specs</th>
                  <th className="py-3 px-4 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {WORKSPACE_ITEMS.map((item) => {
                  const isLocalBlog = item.url?.startsWith('/')
                  const linkLabel = isLocalBlog ? 'Read' : 'Buy'
                  
                  return (
                    <tr key={item.title} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-zinc-950">
                        {item.title}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 font-medium">
                        {item.specs}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={item.url}
                          target={isLocalBlog ? undefined : '_blank'}
                          rel={isLocalBlog ? undefined : 'noopener noreferrer'}
                          className="text-blue-600 font-semibold inline-flex items-center gap-0.5 hover:underline"
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
