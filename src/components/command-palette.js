'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search,
  Sparkles,
  FileText,
  Compass,
  Wand2,
  Laptop,
  Bookmark,
  BookOpen,
  Command,
  Copy,
  Check,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

export const CommandPalette = () => {
  const router = useRouter()
  const pathname = usePathname()
  
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [posts, setPosts] = useState([])
  const [copied, setCopied] = useState(false)
  
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Prevent Next.js hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch blogs metadata on mount
  useEffect(() => {
    if (!mounted) return
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data)
      })
      .catch((err) => console.error('Failed to load posts for command palette:', err))
  }, [mounted])

  // Reset query and selected index when palette toggled
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Setup Keyboard Listeners
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        return
      }

      // Toggle on '/' or 'k' when not focusing input elements
      const activeEl = document.activeElement
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable)

      if (!isInputFocused && !isOpen) {
        if (e.key === '/' || e.key === 'k') {
          e.preventDefault()
          setIsOpen(true)
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
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
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
  }, [mounted, isOpen, selectedIndex, posts])

  // Scroll selected element into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return
    const container = listRef.current
    const selectedElement = container.children[selectedIndex]
    if (!selectedElement) return

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
      { id: 'social-x', title: 'X (Twitter)', url: 'https://x.com/404priyanshu', icon: <ExternalLink size={16} />, category: 'Social Profiles', isExternal: true },
      { id: 'social-github', title: 'GitHub Profile', url: 'https://github.com/404priyanshu', icon: <ExternalLink size={16} />, category: 'Social Profiles', isExternal: true },
      { id: 'social-linkedin', title: 'LinkedIn Profile', url: 'https://www.linkedin.com/in/404priyanshu', icon: <ExternalLink size={16} />, category: 'Social Profiles', isExternal: true }
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
      return [
        ...staticItems,
        ...blogItems.slice(0, 3),
        ...actionItems
      ]
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
  const handleSelect = (item) => {
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
  }

  if (!mounted) return null

  return (
    <>
      {/* Floating command button trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 hidden lg:flex items-center gap-2 rounded-full border border-zinc-200 bg-white/95 px-3 py-2 text-zinc-500 shadow-md backdrop-blur-md hover:bg-zinc-50 hover:text-zinc-900 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer font-sans"
        aria-label="Open Command Palette"
      >
        <Command size={14} className="text-zinc-400" />
        <span className="text-[10px] font-mono tracking-wider font-semibold text-zinc-500">⌘K</span>
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
              className="relative w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white/98 shadow-2xl backdrop-blur-md flex flex-col max-h-[50vh]"
            >
              {/* Search Header Bar */}
              <div className="relative border-b border-zinc-150">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  placeholder="Type a command or search posts..."
                  className="w-full border-none bg-transparent py-4 pl-12 pr-12 text-[14px] text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:ring-0"
                />
                
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* List Scroll Panel */}
              <div
                ref={listRef}
                className="overflow-y-auto p-2 scrollbar-thin select-none max-h-[35vh]"
              >
                {filteredItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-400 font-mono">
                    No results found for "{query}"
                  </div>
                ) : (
                  filteredItems.map((item, index) => {
                    const isSelected = index === selectedIndex
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onPointerMove={() => setSelectedIndex(index)}
                        className={cn(
                          'group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors cursor-pointer text-sm',
                          isSelected ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(isSelected ? 'text-white' : 'text-zinc-500')}>
                            {item.icon}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium tracking-tight leading-none">
                              {item.title}
                            </span>
                            {item.subtitle && (
                              <span
                                className={cn(
                                  'text-[10px] mt-1 font-mono tracking-tight leading-none',
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
                              'rounded-sm px-1.5 py-0.5 text-[9px] font-mono font-medium tracking-wider uppercase',
                              isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-400'
                            )}
                          >
                            {item.category}
                          </span>
                          <ChevronRight
                            size={12}
                            className={cn(
                              'transition-transform duration-200',
                              isSelected ? 'text-zinc-400 translate-x-0.5' : 'text-zinc-300'
                            )}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Command Footer */}
              <div className="flex items-center justify-between border-t border-zinc-150 bg-zinc-50 px-4 py-2 text-[10px] font-mono text-zinc-400 select-none">
                <div className="flex items-center gap-4">
                  <span>
                    <kbd className="rounded-sm bg-white border px-1 py-0.5 font-sans">↑↓</kbd> to navigate
                  </span>
                  <span>
                    <kbd className="rounded-sm bg-white border px-1.5 py-0.5 font-sans">↵</kbd> to select
                  </span>
                  <span>
                    <kbd className="rounded-sm bg-white border px-1 py-0.5 font-sans">esc</kbd> to close
                  </span>
                </div>
                {copied && (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
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
