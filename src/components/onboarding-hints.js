'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { XIcon } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

const STORAGE_KEY = 'pv_hints'
const NAV_KEY_CODES = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6']
// The number shortcuts and the floating search button only exist on desktop.
const DESKTOP_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'

function readSeen() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

function markSeen(hint) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSeen(), [hint]: true }))
  } catch {
    // Storage can be blocked; the hint then shows again on the next visit.
  }
}

function isTyping() {
  const el = document.activeElement
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

const Key = ({ children }) => (
  <kbd className="inline-grid h-5 min-w-5 place-content-center rounded-sm border border-gray-600 bg-gray-700 px-1 font-sans text-xs font-medium text-gray-200">
    {children}
  </kbd>
)

// Places the tooltip next to its anchor: right of the sidebar links, or above the search button.
function useAnchorPosition(step) {
  const [position, setPosition] = useState(null)

  useLayoutEffect(() => {
    if (!step) return
    const anchorName = step === 'search' ? 'search' : 'nav'

    function update() {
      const anchor = document.querySelector(`[data-hint-anchor="${anchorName}"]`)
      const rect = anchor?.getBoundingClientRect()
      if (!rect || rect.width === 0) return setPosition(null)
      setPosition(
        anchorName === 'nav'
          ? { left: rect.right + 14, top: rect.top + rect.height / 2 }
          : { right: window.innerWidth - rect.right, bottom: window.innerHeight - rect.top + 12 }
      )
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [step])

  return position
}

export function OnboardingHints() {
  // null → nothing shown, 'nav' → number keys, 'nav-done' → short confirmation, 'search' → search button
  const [step, setStep] = useState(null)
  const reduceMotion = useReducedMotion()
  const position = useAnchorPosition(step)

  useEffect(() => {
    if (!window.matchMedia(DESKTOP_QUERY).matches) return

    const seen = readSeen()
    const first = !seen.nav ? 'nav' : !seen.search ? 'search' : null
    if (!first) return

    // Let the page settle before asking for attention.
    const timer = setTimeout(() => setStep(first), 1500)
    return () => clearTimeout(timer)
  }, [])

  const showSearchNext = useCallback((delay) => {
    if (readSeen().search) return setStep(null)
    setStep(null)
    setTimeout(() => setStep(readSeen().search ? null : 'search'), delay)
  }, [])

  const dismiss = useCallback(() => {
    if (step === 'nav') {
      markSeen('nav')
      showSearchNext(600)
    } else {
      markSeen('search')
      setStep(null)
    }
  }, [step, showSearchNext])

  // The badges in the sidebar pulse while the number-key hint is open.
  useEffect(() => {
    document.documentElement.classList.toggle('hint-nav', step === 'nav')
    return () => document.documentElement.classList.remove('hint-nav')
  }, [step])

  useEffect(() => {
    if (!step) return

    function onKeyDown(event) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || isTyping()) return
      if (step === 'nav' && NAV_KEY_CODES.includes(event.code)) {
        markSeen('nav')
        setStep('nav-done')
      } else if (event.key === 'Escape' && step !== 'nav-done') {
        dismiss()
      }
    }

    // Opening the palette in any way (button, ⌘K, / or k) completes the search hint.
    function onPaletteOpen() {
      markSeen('search')
      if (step === 'search') setStep(null)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('palette:open', onPaletteOpen)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('palette:open', onPaletteOpen)
    }
  }, [step, dismiss])

  useEffect(() => {
    if (step !== 'nav-done') return
    const timer = setTimeout(() => showSearchNext(500), 1800)
    return () => clearTimeout(timer)
  }, [step, showSearchNext])

  const isNav = step === 'nav' || step === 'nav-done'
  // Only read when a tip renders, which happens on the client.
  const isMac = step && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  const offset = reduceMotion ? 0 : 6

  return (
    <div aria-live="polite">
      <AnimatePresence>
        {step && position && (
          <motion.div
            key={isNav ? 'nav' : 'search'}
            role="note"
            // The nav tip is centred on the sidebar links, so its y stays at -50%.
            initial={{ opacity: 0, x: isNav ? -offset : 0, y: isNav ? '-50%' : offset }}
            animate={{ opacity: 1, x: 0, y: isNav ? '-50%' : 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            style={position}
            className="fixed z-45 w-64 rounded-xl bg-gray-950 p-3.5 text-[13px] leading-relaxed text-gray-300 shadow-[0_8px_24px_-6px_rgb(0_0_0/0.35)]"
          >
            <span
              aria-hidden="true"
              className={`absolute size-2.5 rotate-45 bg-gray-950 ${
                isNav ? 'top-1/2 -left-1 -translate-y-1/2' : 'right-10 -bottom-1'
              }`}
            />

            {step === 'nav-done' ? (
              <p className="m-0 font-medium text-white">Nice. The numbers work on every page.</p>
            ) : (
              <>
                <div className="mb-1 flex items-start justify-between gap-3">
                  <p className="m-0 font-medium text-white">
                    {isNav ? 'Jump around with your keyboard' : 'Looking for something specific?'}
                  </p>
                  <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Dismiss tip"
                    className="-mt-0.5 -mr-1 rounded-sm p-0.5 text-gray-500 hover:text-white"
                  >
                    <XIcon size={14} />
                  </button>
                </div>

                {isNav ? (
                  <p className="m-0">
                    Each page has a number. Press <Key>2</Key> to open Writing, or try any key from <Key>1</Key> to{' '}
                    <Key>6</Key>.
                  </p>
                ) : (
                  <p className="m-0">
                    Search my posts, pages and profiles from anywhere. Press <Key>{isMac ? '⌘' : 'Ctrl'}</Key>{' '}
                    <Key>K</Key> or <Key>/</Key>.
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{isNav ? 'Tip 1 of 2' : 'Tip 2 of 2'}</span>
                  <button type="button" onClick={dismiss} className="font-medium text-gray-300 hover:text-white">
                    {isNav ? 'Skip' : 'Got it'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
