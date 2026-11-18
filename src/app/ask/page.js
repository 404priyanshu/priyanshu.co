import { AskChat } from '@/components/ask-chat'
import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Ask',
  description: 'Ask an AI assistant about my experience, projects, skills, and writing. Answers come from my notes.',
  path: '/ask'
})

export default function AskPage() {
  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Ask" />
      <div className="content-wrapper">
        <div className="content animate-reveal">
          <PageTitle title="Ask" />
          <p className="text-[13.5px] leading-relaxed text-zinc-500">
            Ask about my work, projects, skills, writing, or how to reach me. A small RAG pipeline finds the matching
            notes and blog sections, and an AI model answers from them.
          </p>
          <AskChat />
        </div>
      </div>
    </ScrollArea>
  )
}
