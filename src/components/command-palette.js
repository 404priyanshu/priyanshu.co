'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Copy,
  ExternalLink,
  FileText,
  Laptop,
  Search,
  Sparkles,
  Wand2
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

const subscribeToNothing = () => () => {}

export const CommandPalette = () => {
  const router = useRouter()
  const pathname = usePathname()

  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  )
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [posts, setPosts] = useState([])
  const [copied, setCopied] = useState(false)

  const inputRef = useRef(null)
  const listRef = useRef(null)
  const shouldScrollSelection = useRef(false)

  // Fetch blogs metadata on mount
  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data)
      })
      .catch((err) => console.error('Failed to load posts for command palette:', err))
  }, [])

  // Opening resets the query and focuses the input. Done here rather than in
  // an effect so no setState runs during the open render.
  const openPalette = useCallback(() => {
    shouldScrollSelection.current = false
    setQuery('')
    setSelectedIndex(0)
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50)
  }, [])

  // Lock background scroll while the palette is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Only keyboard navigation should scroll; hovering must leave the list still.
  useEffect(() => {
    if (!isOpen || !listRef.current || !shouldScrollSelection.current) return
    shouldScrollSelection.current = false
    const container = listRef.current
    const selectedElement = container.children[selectedIndex]
    if (!selectedElement) return

    // The list is positioned so row offsets are relative to this scroll container.
    const containerTop = container.scrollTop
    const containerBottom = containerTop + container.clientHeight
    const elemTop = selectedElement.offsetTop
    const elemBottom = elemTop + selectedElement.clientHeight

    if (elemTop < containerTop) {
      container.scrollTop = elemTop
    } else if (elemBottom > containerBottom) {
      container.scrollTop = elemBottom - container.clientHeight
    }
  }, [selectedIndex, isOpen])

  // Static site paths catalog
  const staticItems = useMemo(
    () => [
      { id: 'home', title: 'Home', url: '/', icon: <Sparkles size={16} />, category: 'Pages' },
      { id: 'writing', title: 'Writing Index', url: '/writing', icon: <FileText size={16} />, category: 'Pages' },
      { id: 'journey', title: 'Journey Timeline', url: '/journey', icon: <Compass size={16} />, category: 'Pages' },
      { id: 'stack', title: 'Stack & Tools', url: '/stack', icon: <Wand2 size={16} />, category: 'Pages' },
      { id: 'workspace', title: 'Workspace Specs', url: '/workspace', icon: <Laptop size={16} />, category: 'Pages' },
      { id: 'bookmarks', title: 'Bookmarks List', url: '/bookmarks', icon: <Bookmark size={16} />, category: 'Pages' },
      { id: 'books', title: 'Bookshelf', url: '/books', icon: <BookOpen size={16} />, category: 'Pages' }
    ],
    []
  )

  // Actions catalog
  const actionItems = useMemo(
    () => [
      {
        id: 'copy-url',
        title: 'Copy Current Page Link',
        actionType: 'copy',
        icon: <Copy size={16} />,
        category: 'Utilities'
      }
    ],
    []
  )

  // Social profiles catalog
  const socialItems = useMemo(
    () => [
      {
        id: 'social-x',
        title: 'X (Twitter)',
        url: 'https://x.com/404priyanshu',
        icon: <ExternalLink size={16} />,
        category: 'Social Profiles',
        isExternal: true
      },
      {
        id: 'social-github',
        title: 'GitHub Profile',
        url: 'https://github.com/404priyanshu',
        icon: <ExternalLink size={16} />,
        category: 'Social Profiles',
        isExternal: true
      },
      {
        id: 'social-linkedin',
        title: 'LinkedIn Profile',
        url: 'https://www.linkedin.com/in/404priyanshu',
        icon: <ExternalLink size={16} />,
        category: 'Social Profiles',
        isExternal: true
      }
    ],
    []
  )

  // Dynamic filter lists
  const filteredItems = useMemo(() => {
    // Convert blog posts to command items
    const blogItems = posts.map((post) => ({
      id: `post-${post.slug}`,
      title: post.title,
      url: `/writing/${post.slug}`,
      icon: <FileText size={16} className="text-zinc-400" />,
      category: 'Blog Posts',
      subtitle: new Date(post.date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    }))

    const allItems = [...staticItems, ...blogItems, ...actionItems, ...socialItems]

    if (!query) {
      // Return navigation, actions, and top 2 blogs by default
      return [...staticItems, ...blogItems.slice(0, 3), ...actionItems]
    }

    const cleanQuery = query.toLowerCase().trim()
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(cleanQuery) ||
        item.category.toLowerCase().includes(cleanQuery) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(cleanQuery))
    )
  }, [posts, staticItems, actionItems, socialItems, query])

  // Handle action/selection
  const handleSelect = useCallback(
    (item) => {
      if (item.actionType === 'copy') {
        navigator.clipboard.writeText(window.location.origin + pathname)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else if (item.isExternal) {
        window.open(item.url, '_blank', 'noopener,noreferrer')
      } else {
        router.push(item.url)
      }
      setIsOpen(false)
    },
    [pathname, router]
  )

  // Setup Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        isOpen ? setIsOpen(false) : openPalette()
        return
      }

      // Toggle on '/' or 'k' when not focusing input elements
      const activeEl = document.activeElement
      const isInputFocused =
        activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)

      if (!isInputFocused && !isOpen) {
        if (e.key === '/' || e.key === 'k') {
          e.preventDefault()
          openPalette()
          return
        }
      }

      // Modal navigation shortcuts
      if (!isOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!filteredItems.length) return
        shouldScrollSelection.current = true
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!filteredItems.length) return
        shouldScrollSelection.current = true
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredItems, handleSelect, openPalette])

  if (!isClient) return null

  return (
    <>
      {/* Floating command button trigger */}
      <button
        type="button"
        onClick={openPalette}
        className="fixed right-6 bottom-6 z-40 hidden h-11 cursor-pointer items-center gap-2.5 rounded-full border border-zinc-200/80 bg-white/95 pr-2.5 pl-4 font-sans text-zinc-600 shadow-[0_2px_8px_-2px_rgb(0_0_0/0.12)] backdrop-blur-md transition-[color,background-color,border-color,box-shadow] duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 hover:shadow-[0_4px_12px_-3px_rgb(0_0_0/0.16)] focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4 active:bg-zinc-100 lg:flex"
        aria-label="Open Command Palette"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Search size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className="text-sm font-medium">Search</span>
        <kbd
          aria-hidden="true"
          className="ml-1 flex h-6 items-center gap-0.5 rounded-md border border-zinc-200/80 bg-zinc-50 px-1.5 font-sans text-[11px] leading-none font-medium text-zinc-500"
        >
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      {/* Glassmorphic Command Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh] font-sans">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs"
            />

            {/* Dialog panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.05 }}
              className="relative flex max-h-[50vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white/98 shadow-2xl backdrop-blur-md"
            >
              {/* Search Header Bar */}
              <div className="border-zinc-150 relative border-b">
                <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    shouldScrollSelection.current = false
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                    if (listRef.current) listRef.current.scrollTop = 0
                  }}
                  placeholder="Type a command or search posts..."
                  className="w-full border-none bg-transparent py-4 pr-12 pl-12 text-[14px] text-zinc-900 placeholder-zinc-400 focus:ring-0 focus:outline-hidden"
                />

                {query && (
                  <button
                    onClick={() => {
                      shouldScrollSelection.current = false
                      setQuery('')
                      setSelectedIndex(0)
                      if (listRef.current) listRef.current.scrollTop = 0
                      inputRef.current?.focus({ preventScroll: true })
                    }}
                    className="absolute top-1/2 right-4 -translate-y-1/2 rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* List Scroll Panel */}
              <div
                ref={listRef}
                className="relative max-h-[35vh] scrollbar-thin overflow-y-auto overscroll-contain p-2 select-none"
              >
                {filteredItems.length === 0 ? (
                  <div className="py-8 text-center font-mono text-xs text-zinc-400">No results found for "{query}"</div>
                ) : (
                  filteredItems.map((item, index) => {
                    const isSelected = index === selectedIndex

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onPointerMove={() => {
                          shouldScrollSelection.current = false
                          setSelectedIndex(index)
                        }}
                        className={cn(
                          'group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors',
                          isSelected ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(isSelected ? 'text-white' : 'text-zinc-500')}>{item.icon}</span>
                          <div className="flex flex-col">
                            <span className="leading-none font-medium tracking-tight">{item.title}</span>
                            {item.subtitle && (
                              <span
                                className={cn(
                                  'mt-1 font-mono text-[10px] leading-none tracking-tight',
                                  isSelected ? 'text-zinc-300' : 'text-zinc-400'
                                )}
                              >
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wider uppercase',
                              isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-400'
                            )}
                          >
                            {item.category}
                          </span>
                          <ChevronRight
                            size={12}
                            className={cn(
                              'transition-transform duration-200',
                              isSelected ? 'translate-x-0.5 text-zinc-400' : 'text-zinc-300'
                            )}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Command Footer */}
              <div className="border-zinc-150 flex items-center justify-between border-t bg-zinc-50 px-4 py-2 font-mono text-[10px] text-zinc-400 select-none">
                <div className="flex items-center gap-4">
                  <span>
                    <kbd className="rounded-sm border bg-white px-1 py-0.5 font-sans">↑↓</kbd> to navigate
                  </span>
                  <span>
                    <kbd className="rounded-sm border bg-white px-1.5 py-0.5 font-sans">↵</kbd> to select
                  </span>
                  <span>
                    <kbd className="rounded-sm border bg-white px-1 py-0.5 font-sans">esc</kbd> to close
                  </span>
                </div>
                {copied && (
                  <span className="flex items-center gap-1 font-semibold text-green-600">
                    <Check size={10} /> Copied!
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
