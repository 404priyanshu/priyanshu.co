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
        <div className="content animate-reveal space-y-8">
          <PageTitle title="Journey" />

          <div className="border-zinc-150 relative ml-16 space-y-12 border-l py-2 pl-6 select-none">
            {/* Timeline Item 1 */}
            <div className="relative">
              {/* Year Marker on the left */}
              <span className="absolute top-0.5 -left-[5.5rem] w-12 text-right font-mono text-[11px] font-bold text-zinc-950">
                2025
              </span>

              {/* Blue timeline node dot */}
              <span className="absolute top-1.5 -left-[1.82rem] size-2 rounded-full bg-blue-600 ring-4 ring-white" />

              <div className="space-y-3">
                <h3 className="text-[14px] leading-none font-semibold tracking-tight text-zinc-950">
                  Just got myself a new Tesla Model Y Juniper
                </h3>
                <p className="max-w-[65ch] text-[13px] leading-normal font-normal text-zinc-500">
                  Just hit another milestone after buying a house. I'm super excited and totally in love with my very
                  first car.
                </p>
                <img
                  src="/assets/tesla_model_y.avif"
                  alt="Sleek dark stealth grey Tesla Model Y Juniper parked in driveway"
                  className="border-zinc-150 h-auto max-w-full rounded-xl border shadow-xs md:max-w-lg"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative">
              {/* Blue timeline node dot */}
              <span className="absolute top-1.5 -left-[1.82rem] size-2 rounded-full bg-blue-600 ring-4 ring-white" />

              <div className="space-y-3">
                <h3 className="text-[14px] leading-none font-semibold tracking-tight text-zinc-950">
                  Got my very first 3D printer
                </h3>
                <p className="max-w-[65ch] text-[13px] leading-normal font-normal text-zinc-500">
                  I got my very first 3D printer: Bambu Lab A1 Mini. Already printed a desk drawer organizer inspired by
                  Scott Ju-Yan. Totally satisfied!
                </p>
                <img
                  src="/assets/desk_3d_printer.avif"
                  alt="Minimalist wooden desk workspace corner showcasing a mini 3D printer"
                  className="border-zinc-150 h-auto max-w-full rounded-xl border shadow-xs md:max-w-lg"
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
