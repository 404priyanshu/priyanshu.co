import { notFound } from 'next/navigation'
import Markdown from 'markdown-to-jsx'
import './post.css'

import { FloatingHeader } from '@/components/floating-header'
import { PageTitle } from '@/components/page-title'
import { ScrollArea } from '@/components/scroll-area'
import { getAllPostSlugs, getPostBySlug } from '@/lib/markdown'
import { getDateTimeFormat } from '@/lib/utils'

export async function generateStaticParams() {
  const allPosts = getAllPostSlugs()
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.title,
    description: post.description || post.title,
    openGraph: {
      title: post.title,
      description: post.description || post.title,
      type: 'article',
      publishedTime: new Date(post.date).toISOString()
    }
  }
}

export default async function WritingSlug({ params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const dateString = getDateTimeFormat(post.date)

  return (
    <ScrollArea className="bg-white" useScrollAreaId>
      <FloatingHeader scrollTitle={post.title} goBackLink="/writing" />
      <div className="content-wrapper">
        <div className="content @container">
          <PageTitle
            title={post.title}
            subtitle={
              <time dateTime={post.date} className="text-gray-500">
                {dateString}
              </time>
            }
            className="mb-8 flex flex-col gap-3"
          />

          {/* Add blog-post class to enable custom styles */}
          <article className="blog-post mx-auto max-w-none">
            <Markdown>{post.content}</Markdown>
          </article>
        </div>
      </div>
    </ScrollArea>
  )
}
