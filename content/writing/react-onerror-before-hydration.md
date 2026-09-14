---
title: 'Why Your React onError Never Fires on Broken Images'
date: '2026-09-14'
description:
  'Eight broken images, a fallback that never showed up, and a React handler that arrived too late. A small hydration
  bug with a surprisingly simple fix.'
---

# Why Your React onError Never Fires on Broken Images

Eight cover images on my bookmarks page were broken. Annoying, but that's what happens when you borrow images from other
people's websites. Someone moves an asset, an old URL starts returning 404, and your nice grid gets a few ugly holes in
it.

The annoying part was that I'd already written the fallback. It was sitting right there:

```jsx
<img
  src={bookmark.cover || '/assets/fallback.avif'}
  alt={bookmark.title}
  onError={(e) => {
    e.target.onerror = null
    e.target.src = '/assets/fallback.avif'
  }}
/>
```

If the cover fails, show the placeholder. Hard to get much simpler than that.

Except the placeholder never showed up. Just the browser's broken-image icon, apparently quite happy to be part of the
design.

## The image failed before React got there

This page is server-rendered. As soon as the browser receives the HTML and finds the image's `src`, it can start
fetching it. It doesn't wait for React.

React has its own work to do: download the JavaScript, run it, and hydrate the page. That last step connects the
components to the HTML that's already on screen, including their event handlers. The `onError` in the JSX isn't an
inline `onerror` attribute shipped in the HTML.

So there's a window where the browser is loading images but the React handler isn't ready. A cover can return a 404
inside that window. By the time the handler is attached, the image's `error` event has come and gone.

Here's the order that leaves you staring at a broken image:

1. The HTML arrives and the browser requests the cover.
2. The cover returns a 404. The browser fires `error`.
3. React hydrates the image and attaches `onError`.
4. The handler waits for an error that already happened.

This also explains why I kept seeing it on mobile and almost never on my laptop. A slower connection or device gives
that gap more room to cause trouble. The fallback code can look perfectly fine in development and still miss its cue on
someone else's phone.

## The browser still knows the image is broken

Luckily, I didn't need to catch the original event to fix the image. I could check what the browser knew about it once
React was ready.

An image element has two useful properties here: `complete` and `naturalWidth`. For these covers, which have a nonempty
`src`, the check is straightforward:

- `complete` is `false`: the image is still loading. Leave it alone.
- `complete` is `true` and `naturalWidth` is greater than `0`: it loaded. All good.
- `complete` is `true` and `naturalWidth` is `0`: there's no usable image. Show the fallback.

The slightly misleading bit is `complete`. It sounds like success, but a broken image can be complete too. The browser
has finished trying; it hasn't necessarily loaded anything.
[MDN's description of `complete`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/complete) calls this
out explicitly.

## Give the fallback a second way in

A callback ref gives me a place to inspect the image when React attaches to it. If the cover has already failed, I can
swap in the fallback right then.

```jsx
const FALLBACK_COVER = '/assets/fallback.avif'

function showFallback(node) {
  if (node.getAttribute('src') !== FALLBACK_COVER) {
    node.src = FALLBACK_COVER
  }
}

;<img
  src={bookmark.cover || FALLBACK_COVER}
  alt={bookmark.title}
  onError={(e) => showFallback(e.currentTarget)}
  ref={(node) => {
    if (node && node.complete && node.naturalWidth === 0) {
      showFallback(node)
    }
  }}
/>
```

The ref doesn't have to run earlier than `onError`. It can arrive just as late and still help, because it checks the
image's current state.

I kept `onError` for requests that fail after hydration. A lazy-loaded cover further down the page might not even start
loading until I scroll to it. The ref handles the failures that have already happened; the event handler picks up the
later ones.

There's also a small correction to the original snippet here. Setting `node.onerror = null` doesn't remove React's
`onError` handler. The shared helper checks the source instead, so a broken fallback won't keep assigning itself and
retrying.

## Something to check next time

It's easy to read an event handler and assume it covers every time that thing happens. With server-rendered HTML, there
may already be plenty happening before your component gets involved.

For images, the useful question was: has this already failed? Checking `complete` and `naturalWidth` answered that
without needing the browser to fire the event again.

I'll keep that question in mind for other bits of browser state, too, like restored scroll positions. Before waiting for
a change, check what's already there.

And if your fallback image stubbornly refuses to appear, check the timing before rewriting the handler. Mine was waiting
very patiently for old news.
