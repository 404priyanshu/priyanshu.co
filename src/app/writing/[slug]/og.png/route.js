import { ImageResponse } from 'next/og'

import { sharedMetadata } from '@/app/shared-metadata'
import { OpenGraphImage } from '@/components/og-image'
import { getBoldFont, getRegularFont } from '@/lib/fonts'
import { getAllPostSlugs, getPostBySlug } from '@/lib/markdown'
import { getDateTimeFormat } from '@/lib/utils'

// Built once per post at build time, like the bookmark images. Unknown slugs
// return 404 without rendering, so crawlers cannot make each request render an image.
export const dynamicParams = false

export function generateStaticParams() {
  return getAllPostSlugs().map((post) => ({ slug: post.slug }))
}

export const size = {
  width: sharedMetadata.ogImage.width,
  height: sharedMetadata.ogImage.height
}

export async function GET(_, props) {
  const { slug } = await props.params
  const post = getPostBySlug(slug)
  if (!post) return new Response('Not found', { status: 404 })

  const [regularFontData, boldFontData] = await Promise.all([getRegularFont(), getBoldFont()])

  return new ImageResponse(
    <OpenGraphImage
      title={post.title}
      description={`Priyanshu Singh · ${getDateTimeFormat(post.date)}`}
      url="writing"
    />,
    {
      ...size,
      fonts: [
        { name: 'Geist Sans', data: regularFontData, style: 'normal', weight: 400 },
        { name: 'Geist Sans', data: boldFontData, style: 'normal', weight: 500 }
      ]
    }
  )
}
