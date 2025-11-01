import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Suspense } from 'react'

import { FloatingHeader } from '@/components/floating-header'
import { ScreenLoadingSpinner } from '@/components/screen-loading-spinner'
import { ScrollArea } from '@/components/scroll-area'
import { getAllPostSlugs, getPostBySlug } from '@/lib/markdown'

// MDX components for styling
const components = {
  h1: (props) => <h1 className="mt-8 mb-4 text-4xl font-bold" {...props} />,
  h2: (props) => <h2 className="mt-6 mb-3 text-3xl font-semibold" {...props} />,
  h3: (props) => <h3 className="mt-4 mb-2 text-2xl font-semibold" {...props} />,
  p: (props) => <p className="mb-4 leading-relaxed" {...props} />,
  ul: (props) => <ul className="mb-4 list-inside list-disc space-y-2" {...props} />,
  ol: (props) => <ol className="mb-4 list-inside list-decimal space-y-2" {...props} />,
  li: (props) => <li className="ml-4" {...props} />,
  a: (props) => <a className="text-blue-600 hover:underline" {...props} />,
  code: (props) => <code className="rounded bg-gray-100 px-1 py-0.5 text-sm" {...props} />,
  pre: (props) => <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100" {...props} />,
  blockquote: (props) => <blockquote className="my-4 border-l-4 border-gray-300 pl-4 italic" {...props} />,
  hr: (props) => <hr className="my-8 border-gray-200" {...props} />
}

export async function generateStaticParams() {
  const posts = getAllPostSlugs()
  return posts.map((post) => ({
    slug: post.slug
  }))
}

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found'
    }
  }

  return {
    title: post.title,
    description: post.description || post.title,
    openGraph: {
      title: post.title,
      description: post.description || post.title,
      type: 'article',
      publishedTime: post.date,
      authors: ['Priyanshu Singh']
    }
  }
}

export default async function PostPage({ params }) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <ScrollArea useScrollAreaId>
      <FloatingHeader scrollTitle={post.title} goBackLink="/writing" />
      <div className="content-wrapper">
        <div className="content">
          <article>
            <h1 className="mb-2 text-4xl font-bold">{post.title}</h1>
            <div className="mb-8 text-gray-600">
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <Suspense fallback={<ScreenLoadingSpinner />}>
              <div className="prose prose-lg max-w-none">
                <MDXRemote source={post.content} components={components} />
              </div>
            </Suspense>
          </article>
        </div>
      </div>
    </ScrollArea>
  )
}
