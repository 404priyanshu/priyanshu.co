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
                'absolute top-4 right-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-400 opacity-0 transition-all hover:bg-slate-800 hover:text-slate-100 focus:opacity-100 group-hover:opacity-100',
                isCopied && 'border-green-900 bg-green-900/20 text-green-400 hover:border-green-900 hover:bg-green-900/20 hover:text-green-400',
                className
            )}
        >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            <span className="sr-only">Copy code</span>
        </button>
    )
}
