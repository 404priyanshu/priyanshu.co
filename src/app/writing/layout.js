import { WritingShell } from '@/components/writing-shell'
import { getAllPosts } from '@/lib/markdown'
import { getDateTimeFormat, getSortedPosts } from '@/lib/utils'

export default async function WritingLayout({ children }) {
  const posts = getSortedPosts(await getAllPosts()).map(({ slug, title, date }) => ({
    slug,
    title,
    date,
    displayDate: getDateTimeFormat(date)
  }))
  return <WritingShell posts={posts}>{children}</WritingShell>
}
