'use client'

import { Check, Link2, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const SITE_URL = 'https://priyanshu.co'

function useCopy() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Clipboard access can be denied; there's nothing useful to show.
    }
  }

  return [copied, copy]
}

// Native share sheet where the browser has one (mostly phones), otherwise copy
// the link. Share can throw when the user dismisses the sheet; that's not an
// error worth surfacing.
export function ShareButton({ slug, title, className }) {
  const url = `${SITE_URL}/writing/${slug}`
  const [copied, copy] = useCopy()

  const share = async () => {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title, url }).catch(() => {})
      return
    }
    copy(url)
  }

  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 font-sans text-xs font-medium tracking-normal text-zinc-600 normal-case transition-colors hover:border-zinc-300 hover:text-zinc-900',
        className
      )}
    >
      {copied ? <Check size={13} aria-hidden="true" /> : <Share2 size={13} aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Link copied' : 'Share'}</span>
    </button>
  )
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const linkClass =
  'inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 no-underline transition-colors hover:border-zinc-300 hover:text-zinc-950'

export function SharePost({ slug, title }) {
  const url = `${SITE_URL}/writing/${slug}`
  const [copied, copy] = useCopy()

  const targets = [
    {
      label: 'X',
      icon: <XIcon />,
      href: `https://x.com/intent/post?${new URLSearchParams({ text: title, url })}`
    },
    {
      label: 'LinkedIn',
      icon: <LinkedInIcon />,
      href: `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url })}`
    }
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-zinc-500">Share this post</span>
      <button type="button" onClick={() => copy(url)} className={cn(linkClass, 'cursor-pointer')}>
        {copied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
        <span aria-live="polite">{copied ? 'Copied' : 'Copy link'}</span>
      </button>
      {targets.map(({ label, icon, href }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {icon}
          {label}
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ))}
    </div>
  )
}
