import { useEffect, useState } from 'react'

export const useViewData = (slug) => {
  const [viewData, setViewData] = useState({ slug, data: null, status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    let pending = false

    async function getViewData() {
      if (pending || document.visibilityState === 'hidden') return
      pending = true

      try {
        const query = slug ? `?slug=${encodeURIComponent(slug)}` : ''
        const response = await fetch(`/api/views${query}`, {
          cache: 'no-store',
          signal: controller.signal
        })
        if (!response.ok) throw new Error('Unable to fetch view counts')
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error('Invalid view count response')
        if (!controller.signal.aborted) setViewData({ slug, data, status: 'ready' })
      } catch {
        if (!controller.signal.aborted) setViewData({ slug, data: null, status: 'error' })
      } finally {
        pending = false
      }
    }

    getViewData()
    const interval = setInterval(getViewData, 30000)
    window.addEventListener('focus', getViewData)
    document.addEventListener('visibilitychange', getViewData)

    return () => {
      controller.abort()
      clearInterval(interval)
      window.removeEventListener('focus', getViewData)
      document.removeEventListener('visibilitychange', getViewData)
    }
  }, [slug])

  return viewData.slug === slug ? viewData : { data: null, status: 'loading' }
}
