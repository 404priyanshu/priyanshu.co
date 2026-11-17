import { serializeJsonLd } from '@/lib/seo'

/** Structured data for search engines. `data` is one schema.org object or a `@graph`. */
export function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
}
