import { CopyButton } from '@/components/copy-button'

export function Pre({ children, ...props }) {
  // Extract text content from children (which is usually a <code> element)
  const text = children?.props?.children || ''
  const className = children?.props?.className || ''

  // Extract language name (e.g. "language-js" -> "JS", "lang-bash" -> "bash")
  let lang = ''
  const match = className.match(/(?:lang|language)-(\w+)/)
  if (match) {
    lang = match[1]
  }

  // Format language display nicely
  const displayLang = lang
    ? lang.toUpperCase() === 'JS' ? 'JavaScript' :
      lang.toUpperCase() === 'TS' ? 'TypeScript' :
      lang.toUpperCase() === 'JSX' ? 'React JSX' :
      lang.toUpperCase() === 'TSX' ? 'React TSX' :
      lang.toUpperCase() === 'HTML' ? 'HTML' :
      lang.toUpperCase() === 'CSS' ? 'CSS' :
      lang.toUpperCase() === 'JSON' ? 'JSON' :
      lang.toUpperCase() === 'BASH' ? 'Bash' :
      lang.toUpperCase() === 'SH' ? 'Shell' :
      lang.charAt(0).toUpperCase() + lang.slice(1)
    : ''

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-850 bg-zinc-900/60 px-4 py-2 select-none">
        {/* Left macOS window controls */}
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f56]/90" />
          <span className="size-2.5 rounded-full bg-[#ffbd2e]/90" />
          <span className="size-2.5 rounded-full bg-[#27c93f]/90" />
        </div>

        {/* Center/Right Info and Actions */}
        <div className="flex items-center gap-3">
          {displayLang && (
            <span className="font-mono text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
              {displayLang}
            </span>
          )}
          <CopyButton text={text} />
        </div>
      </div>

      {/* Code body */}
      <pre {...props} className="group relative !my-0 !border-0 !bg-transparent !py-4 !px-4 overflow-x-auto text-[13px] leading-relaxed">
        {children}
      </pre>
    </div>
  )
}

