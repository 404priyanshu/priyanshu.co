import { AskChat } from '@/components/ask-chat'
import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'

export const metadata = {
  title: 'Ask',
  description: 'Ask an AI assistant about my experience, projects, and skills. Answers come from my resume.'
}

export default function AskPage() {
  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Ask" />
      <div className="content-wrapper">
        <div className="content animate-reveal">
          <PageTitle title="Ask" />
          <p className="text-[13.5px] leading-relaxed text-zinc-500">
            Ask about my work, projects, skills, or how to reach me. A small RAG pipeline finds the matching parts of my
            resume, and an AI model answers from them.
          </p>
          <AskChat />
        </div>
      </div>
    </ScrollArea>
  )
}
