import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'

export const metadata = {
  title: 'Journey',
  description: 'My professional journey, milestones, and career timeline.'
}

export default async function JourneyPage() {
  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Journey" />
      <div className="content-wrapper">
        <div className="content space-y-8 animate-reveal">
          <PageTitle title="Journey" />
          
          <div className="relative border-l border-zinc-150 pl-6 ml-16 space-y-12 py-2 select-none">
            
            {/* Timeline Item 1 */}
            <div className="relative">
              {/* Year Marker on the left */}
              <span className="absolute -left-[5.5rem] top-0.5 text-[11px] font-mono font-bold text-zinc-950 text-right w-12">
                2025
              </span>
              
              {/* Blue timeline node dot */}
              <span className="absolute -left-[1.82rem] top-1.5 size-2 rounded-full bg-blue-600 ring-4 ring-white" />
              
              <div className="space-y-3">
                <h3 className="font-semibold text-[14px] text-zinc-950 tracking-tight leading-none">
                  Just got myself a new Tesla Model Y Juniper
                </h3>
                <p className="text-[13px] text-zinc-500 leading-normal font-normal max-w-[65ch]">
                  Just hit another milestone after buying a house. I'm super excited and totally in love with my very first car.
                </p>
                <img 
                  src="/assets/tesla_model_y.png" 
                  alt="Sleek dark stealth grey Tesla Model Y Juniper parked in driveway"
                  className="rounded-xl border border-zinc-150 shadow-xs max-w-full md:max-w-lg h-auto"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative">
              {/* Blue timeline node dot */}
              <span className="absolute -left-[1.82rem] top-1.5 size-2 rounded-full bg-blue-600 ring-4 ring-white" />
              
              <div className="space-y-3">
                <h3 className="font-semibold text-[14px] text-zinc-950 tracking-tight leading-none">
                  Got my very first 3D printer
                </h3>
                <p className="text-[13px] text-zinc-500 leading-normal font-normal max-w-[65ch]">
                  I got my very first 3D printer: Bambu Lab A1 Mini. Already printed a desk drawer organizer inspired by Scott Ju-Yan. Totally satisfied!
                </p>
                <img 
                  src="/assets/desk_3d_printer.png" 
                  alt="Minimalist wooden desk workspace corner showcasing a mini 3D printer"
                  className="rounded-xl border border-zinc-150 shadow-xs max-w-full md:max-w-lg h-auto"
                  loading="lazy"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
