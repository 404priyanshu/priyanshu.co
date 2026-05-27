---
title: 'Optimizing Next.js LCP with Fetch Priority'
date: '2025-02-18'
description: 'How to leverage the Fetch Priority API inside Next.js image components to optimize Largest Contentful Paint and core web vitals performance.'
---

# Optimizing Next.js LCP with Fetch Priority

In modern web development, Largest Contentful Paint (LCP) remains one of the most critical Core Web Vitals. It measures when the main content of a page has likely loaded, directly correlating to user retention and search engine rankings. For most content-heavy landing pages or media sites, the LCP element is almost always an image—a hero graphic, a product photo, or a banner.

While Next.js provides the powerful `next/image` component to automate compression, resizing, and modern formats like WebP or AVIF, optimizing when that image is fetched by the browser is equally critical. This is where the Fetch Priority API becomes indispensable.

## Understanding Fetch Priority

The browser's layout engine prioritizes resources dynamically based on their type, placement, and visibility. Traditionally, images are assigned a relatively low priority compared to render-blocking CSS and critical JavaScript. 

With the Fetch Priority API, developers can explicitly hint to the browser that a specific resource should be loaded with a higher or lower priority. By applying `fetchpriority="high"` to an LCP candidate image, we tell the network scheduler to prioritize it immediately after critical styles, bypassing less urgent script assets.

## Implementation in Next.js

Next.js has native support for adjusting image priority. By using the `priority` attribute in `next/image`, the framework automatically generates a preload tag with high fetch priority in the document head:

```html
<link 
  rel="preload" 
  as="image" 
  href="/hero.webp" 
  fetchpriority="high" 
/>
```

Here is a standard implementation for a hero banner component:

```javascript
import Image from 'next/image'

export function HeroBanner() {
  return (
    <div className="relative w-full h-[400px]">
      <Image
        src="/assets/hero-banner.webp"
        alt="Core platform dashboard showcase"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
        className="object-cover"
      />
    </div>
  )
}
```

By marking this image as `priority`, the image preload tag is injected directly into the HTML payload sent to the client. This bypasses the need for the browser to parse the CSS grid or DOM to discover the image, significantly reducing LCP load delay.

## Verifying the Impact

To confirm the optimization:
1. Open Chrome DevTools and navigate to the Network panel.
2. Filter by images and look for your hero asset.
3. Verify that the "Priority" column lists it as "High" instead of "Low" or "Medium".
4. Run a Lighthouse or WebPageTest audit to verify the decrease in LCP timing, which frequently drops by 150ms to 300ms.

Fine-tuning network request ordering guarantees that critical content is available immediately, resulting in a fast, seamless experience for visitors.
