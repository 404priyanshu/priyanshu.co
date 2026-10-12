'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

// The address as text with a copy button, for visitors without a mail app.
export function CopyEmail({ email, className }) {
  const [isCopied, setIsCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Clipboard blocked: the address is still on screen to select by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'group/copy inline-flex items-center gap-1.5 rounded-md text-xs text-gray-500 transition-colors select-text hover:text-gray-900',
        className
      )}
    >
      {email}
      {isCopied ? (
        <Check size={12} strokeWidth={2} className="text-[#3f8a55]" aria-hidden="true" />
      ) : (
        <Copy size={12} strokeWidth={1.75} className="opacity-60 group-hover/copy:opacity-100" aria-hidden="true" />
      )}
      <span className="sr-only" aria-live="polite">
        {isCopied ? 'Email address copied' : 'Copy email address'}
      </span>
    </button>
  )
}
