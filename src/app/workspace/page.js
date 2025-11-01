import Image from 'next/image'

import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import { WORKSPACE_ITEMS } from '@/lib/constants'

export const metadata = {
  title: 'Workspace',
  description: 'My workspace setup and gear I use daily.'
}

export default function WorkspacePage() {
  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Workspace" />
      <div className="content-wrapper">
        <div className="content">
          <PageTitle title="Workspace" />
          <p className="mb-8">Here's my current workspace setup and the tools I use to build software.</p>

          <div className="space-y-4">
            {WORKSPACE_ITEMS.map((item) => (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.specs}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
