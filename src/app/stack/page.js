import Image from 'next/image'

import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Stack',
  description: 'My go-to list of tools and software I use daily to build systems.'
}

// Each icon is the tool's official app icon or logo, in public/assets/stack.
// `frame` says how it is drawn, so they all look the same size:
// - app: a macOS app icon. It has its own padding, so it shows as is.
// - tile: a full-bleed square. It gets rounded corners at the app icons' visible size.
// - logo: a bare mark. It sits on a small white tile.
const STACK_ITEMS = [
  {
    name: 'Ghostty',
    link: 'https://ghostty.org',
    icon: 'ghostty.png',
    frame: 'app',
    desc: 'My main terminal, where I run commands and work on projects.'
  },
  {
    name: 'Zed',
    link: 'https://zed.dev',
    icon: 'zed.png',
    frame: 'app',
    desc: 'My main code editor and where I do most of my coding these days.'
  },
  {
    name: 'Claude Code',
    link: 'https://claude.com/product/claude-code',
    icon: 'claude-code.png',
    frame: 'app',
    desc: "Anthropic's coding agent. I use it in the terminal and in the Claude desktop app."
  },
  {
    name: 'Codex',
    link: 'https://openai.com/codex',
    icon: 'codex.png',
    frame: 'app',
    desc: "OpenAI's coding agent, in the terminal and as a desktop app. I wrote about delegating work to its subagents."
  },
  {
    name: 'OpenCode',
    link: 'https://opencode.ai',
    icon: 'opencode.png',
    frame: 'app',
    desc: 'An open-source AI coding agent I use in the terminal.'
  },
  {
    name: 'Pi',
    link: 'https://pi.dev',
    icon: 'pi.svg',
    frame: 'logo',
    desc: 'A minimal, extensible coding agent for the terminal.'
  },
  {
    name: 'Hermes Agent',
    link: 'https://hermes-agent.nousresearch.com',
    icon: 'hermes.png',
    frame: 'app',
    desc: 'The open-source AI agent from Nous Research. I run it on my own machine.'
  },
  {
    name: 'T3 Code',
    link: 'https://t3.codes',
    icon: 't3-code.png',
    frame: 'app',
    desc: 'An open-source desktop app where I run and manage my coding agents.'
  },
  {
    name: 'Ollama',
    link: 'https://ollama.com',
    icon: 'ollama.png',
    frame: 'app',
    desc: 'Where I pull and run open models locally, from the command line or its API.'
  },
  {
    name: 'LM Studio',
    link: 'https://lmstudio.ai',
    icon: 'lm-studio.png',
    frame: 'app',
    desc: 'Where I run and test local LLMs on my own machine.'
  },
  {
    name: 'Docker',
    link: 'https://www.docker.com/products/docker-desktop/',
    icon: 'docker.png',
    frame: 'app',
    desc: 'I run databases and other services in containers with it, so my machine stays clean.'
  },
  {
    name: 'Nstlgy Dark',
    link: 'https://zed.dev/extensions/nstlgy-dark',
    // The theme has no logo: this tile uses its background and syntax colors.
    icon: 'nstlgy-dark.svg',
    frame: 'tile',
    desc: "My own Zed theme, inspired by Josh W. Comeau's code playground. It has 63k+ downloads."
  },
  {
    name: 'tldraw',
    link: 'https://www.tldraw.com',
    icon: 'tldraw.png',
    frame: 'tile',
    desc: 'My replacement for Excalidraw. I use it to sketch ideas and draw things out.'
  },
  {
    name: 'Dia',
    link: 'https://www.diabrowser.com',
    icon: 'dia.png',
    frame: 'app',
    desc: 'The AI browser from The Browser Company, now part of Atlassian. I use it for everyday browsing.'
  },
  {
    name: 'Cloudflare WARP',
    link: 'https://one.one.one.one',
    icon: 'cloudflare-warp.png',
    frame: 'app',
    desc: 'I use WARP to encrypt my internet traffic through Cloudflare.'
  },
  {
    name: '1Password',
    link: 'https://1password.com',
    icon: '1password.png',
    frame: 'app',
    desc: 'Where I keep my passwords and secrets.'
  },
  {
    name: 'Raycast',
    link: 'https://www.raycast.com',
    icon: 'raycast.png',
    frame: 'app',
    desc: 'My launcher: a faster, more capable Spotlight.'
  },
  {
    name: 'Wispr Flow',
    link: 'https://wisprflow.ai',
    icon: 'wispr-flow.png',
    frame: 'app',
    desc: 'Voice dictation that turns what I say into clean text in any app.'
  },
  {
    name: 'BetterTouchTool',
    link: 'https://folivora.ai',
    icon: 'bettertouchtool.png',
    frame: 'tile',
    desc: 'Gesture management tool for your mouse and trackpad.'
  },
  {
    name: 'MonitorControl',
    link: 'https://github.com/MonitorControl/MonitorControl',
    icon: 'monitorcontrol.png',
    frame: 'app',
    desc: "Controls my external display's brightness and volume from the keyboard."
  },
  {
    name: 'MeetingBar',
    link: 'https://meetingbar.app',
    icon: 'meetingbar.png',
    frame: 'app',
    desc: 'Shows my next meeting in the menu bar, so I can join it in one click.'
  },
  {
    name: 'Bartender',
    link: 'https://www.macbartender.com',
    icon: 'bartender.png',
    frame: 'tile',
    desc: 'This is my way of hiding things from the menu bar.'
  },
  {
    name: 'Captin',
    link: 'https://formulae.brew.sh/cask/captin',
    icon: 'captin.png',
    frame: 'tile',
    desc: 'Shows the Caps Lock status on screen when I press it.'
  },
  {
    name: 'Switchbar',
    link: 'https://webcatalog.io/en/switchbar',
    icon: 'switchbar.svg',
    frame: 'logo',
    desc: 'Allows you to select which browser, browser profile, or email client to use when you click on a link.'
  },
  {
    name: 'Raindrop',
    link: 'https://raindrop.io',
    icon: 'raindrop.png',
    frame: 'logo',
    desc: 'My bookmark manager. It also feeds the Bookmarks page on this site.'
  },
  {
    name: 'Hand Mirror',
    link: 'https://handmirror.app',
    icon: 'hand-mirror.png',
    frame: 'app',
    desc: 'A one-click camera check, right from the menu bar.'
  }
]

const FRAME = {
  app: { box: '', image: 'size-10' },
  tile: { box: '', image: 'size-8 rounded-[9px] ring-1 ring-black/[0.06]' },
  logo: { box: 'size-8 rounded-[9px] bg-white p-1.5 ring-1 ring-black/[0.08]', image: 'size-full object-contain' }
}

// Decorative: the tool's name is right beside it.
function StackIcon({ icon, frame }) {
  const style = FRAME[frame]
  const isSvg = icon.endsWith('.svg')
  return (
    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center">
      <span className={cn('flex items-center justify-center', style.box)}>
        <Image
          src={`/assets/stack/${icon}`}
          alt=""
          width={40}
          height={40}
          // Next.js does not optimize SVGs; they are tiny and sharp at any size.
          unoptimized={isSvg}
          className={style.image}
        />
      </span>
    </span>
  )
}

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
                <div className="flex items-start gap-3">
                  <StackIcon icon={item.icon} frame={item.frame} />
                  <div className="min-w-0 space-y-1">
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
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
