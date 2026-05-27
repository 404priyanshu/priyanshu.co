import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import { SpotlightCard } from '@/components/ui/spotlight-card'

export const metadata = {
  title: 'Stack',
  description: 'My go-to list of tools, hardware, and software I use daily to build systems.'
}

const STACK_ITEMS = [
  {
    name: 'One Hunter',
    link: 'https://github.com/one-hunter/theme',
    desc: 'My most recently used theme, inspired by Vercel Theme ▲ and One Dark Pro.'
  },
  {
    name: 'Hyper',
    link: 'https://hyper.is',
    desc: 'A terminal built on web technologies.'
  },
  {
    name: '1Password',
    link: 'https://1password.com',
    desc: 'Best tool for password management.'
  },
  {
    name: 'CodeWhisperer',
    link: 'https://aws.amazon.com/codewhisperer',
    desc: 'It adds autocompletion to your existing terminal.'
  },
  {
    name: 'Raycast',
    link: 'https://www.raycast.com',
    desc: "It's like macOS Spotlight on steroids."
  },
  {
    name: 'BetterTouchTool',
    link: 'https://folivora.ai',
    desc: 'Gesture management tool for your mouse and trackpad.'
  },
  {
    name: 'MonitorControl',
    link: 'https://github.com/MonitorControl/MonitorControl',
    desc: "A great tool to control your display's brightness & volume."
  },
  {
    name: 'MeetingBar',
    link: 'https://meetingbar.app',
    desc: 'The best way to track and manage your meetings.'
  },
  {
    name: 'Bartender',
    link: 'https://www.macbartender.com',
    desc: 'This is my way of hiding things from the menu bar.'
  },
  {
    name: 'Captin',
    link: 'https://captinhq.com',
    desc: "If you'd like to see the capslock status on click, Captin is the tool you're looking for."
  },
  {
    name: 'Switchbar',
    link: 'https://switchbar.app',
    desc: 'Allows you to select which browser, browser profile, or email client to use when you click on a link.'
  },
  {
    name: 'Raindrop',
    link: 'https://raindrop.io',
    desc: "The best all-in-one bookmark manager I've ever seen and used."
  },
  {
    name: 'Hand Mirror',
    link: 'https://handmirror.app',
    desc: 'A one-click camera check, right from the menu bar.'
  }
]

export default function StackPage() {
  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle="Stack" />
      <div className="content-wrapper">
        <div className="content space-y-6 animate-reveal">
          <PageTitle title="Stack" />
          <p className="text-[13.5px] leading-relaxed text-zinc-500">
            Here is my go-to list of tools & software that I enjoy using and have helped me level up my skills.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STACK_ITEMS.map((item) => (
              <SpotlightCard
                key={item.name}
                className="p-4 border border-zinc-150 rounded-xl bg-white hover:border-zinc-300 transition-colors shadow-xs"
              >
                <div className="space-y-1">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-900 font-semibold text-[13.5px] inline-flex items-center gap-0.5 hover:underline decoration-zinc-350"
                  >
                    {item.name}
                    <span className="text-[10px] text-zinc-400 font-normal no-underline select-none">↗</span>
                  </a>
                  <p className="text-zinc-500 text-[12px] leading-relaxed m-0">{item.desc}</p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
