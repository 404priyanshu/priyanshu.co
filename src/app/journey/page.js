import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'

export const metadata = {
  title: 'Journey',
  description: 'My professional journey and career timeline.'
}

export default async function JourneyPage() {
  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Journey" />
      <div className="content-wrapper">
        <div className="content">
          <PageTitle title="Journey" />
          <div className="space-y-8">
            <p>My career journey and experiences.</p>

            {/* Example timeline - customize this */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">2024 - Present</h3>
                <p className="text-gray-600">Software Developer</p>
                <p className="mt-2">Working on exciting web projects...</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">2023</h3>
                <p className="text-gray-600">Learning & Building</p>
                <p className="mt-2">Started my journey in web development...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
