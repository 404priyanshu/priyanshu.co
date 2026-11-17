import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import { SpotlightCard } from '@/components/ui/spotlight-card'

export const metadata = {
  title: 'Stack',
  description: 'My go-to list of tools and software I use daily to build systems.'
}

const STACK_ITEMS = [
  {
    name: 'Ghostty',
    link: 'https://ghostty.org',
    desc: 'My main terminal, where I run commands and work on projects.'
  },
  {
    name: 'Zed',
    link: 'https://zed.dev',
    desc: 'My main code editor and where I do most of my coding these days.'
  },
  {
    name: 'tldraw',
    link: 'https://www.tldraw.com',
    desc: 'My replacement for Excalidraw. I use it to sketch ideas and draw things out.'
  },
  {
    name: 'Dia',
    link: 'https://www.diabrowser.com',
    desc: 'The AI browser from The Browser Company, now part of Atlassian. I use it for everyday browsing.'
  },
  {
    name: 'Cloudflare WARP',
    link: 'https://one.one.one.one',
    desc: 'I use WARP to encrypt my internet traffic through Cloudflare.'
  },
  {
    name: 'LM Studio',
    link: 'https://lmstudio.ai',
    desc: 'Where I run and test local LLMs on my own machine.'
  },
  {
    name: 'OpenCode',
    link: 'https://opencode.ai',
    desc: 'An open-source AI coding agent I use in the terminal.'
  },
  {
    name: 'Nstlgy Dark',
    link: 'https://zed.dev/extensions/nstlgy-dark',
    desc: "My own Zed theme, inspired by Josh W. Comeau's code playground. It has 63k+ downloads."
  },
  {
    name: '1Password',
    link: 'https://1password.com',
    desc: 'Where I keep my passwords and secrets.'
  },
  {
    name: 'Raycast',
    link: 'https://www.raycast.com',
    desc: 'My launcher: a faster, more capable Spotlight.'
  },
  {
    name: 'BetterTouchTool',
    link: 'https://folivora.ai',
    desc: 'Gesture management tool for your mouse and trackpad.'
  },
  {
    name: 'MonitorControl',
    link: 'https://github.com/MonitorControl/MonitorControl',
    desc: "Controls my external display's brightness and volume from the keyboard."
  },
  {
    name: 'MeetingBar',
    link: 'https://meetingbar.app',
    desc: 'Shows my next meeting in the menu bar, so I can join it in one click.'
  },
  {
    name: 'Bartender',
    link: 'https://www.macbartender.com',
    desc: 'This is my way of hiding things from the menu bar.'
  },
  {
    name: 'Captin',
    link: 'https://captin.nl',
    desc: 'Shows the Caps Lock status on screen when I press it.'
  },
  {
    name: 'Switchbar',
    link: 'https://webcatalog.io/en/switchbar',
    desc: 'Allows you to select which browser, browser profile, or email client to use when you click on a link.'
  },
  {
    name: 'Raindrop',
    link: 'https://raindrop.io',
    desc: 'My bookmark manager. It also feeds the Bookmarks page on this site.'
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
        <div className="content animate-reveal space-y-6">
          <PageTitle title="Stack" />
          <p className="text-[13.5px] leading-relaxed text-zinc-500">
            Here is my go-to list of tools and software that I enjoy using and that have helped me level up my skills.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {STACK_ITEMS.map((item) => (
              <SpotlightCard
                key={item.name}
                className="border-zinc-150 rounded-xl border bg-white p-4 shadow-xs transition-colors hover:border-zinc-300"
              >
                <div className="space-y-1">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="decoration-zinc-350 inline-flex items-center gap-0.5 text-[13.5px] font-semibold text-zinc-900 hover:underline"
                  >
                    {item.name}
                    <span className="text-[10px] font-normal text-zinc-400 no-underline select-none">↗</span>
                  </a>
                  <p className="m-0 text-[12px] leading-relaxed text-zinc-500">{item.desc}</p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
