'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

export function CopyButton({ text, className }) {
  const [isCopied, setIsCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <button
      disabled={isCopied}
      onClick={copy}
      className={cn(
        'relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-850 bg-transparent text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-100 focus:outline-hidden cursor-pointer',
        isCopied &&
          'border-green-900/50 bg-green-900/20 text-green-400 hover:border-green-900/50 hover:bg-green-900/20 hover:text-green-400',
        className
      )}
    >
      {isCopied ? <Check size={16} /> : <Copy size={16} />}
      <span className="sr-only">Copy code</span>
    </button>
  )
}
