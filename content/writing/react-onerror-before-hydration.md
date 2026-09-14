---
title: 'Why Your React onError Never Fires on Broken Images'
date: '2026-09-14'
description:
  'An onError fallback on a server-rendered image is a handler attached after the failure has already happened. Why the
  event is unrecoverable, and how to check the DOM state instead.'
---

# Why Your React onError Never Fires on Broken Images

The bookmarks page on this site hotlinks cover images from the sites being bookmarked. That is the deal you make with
the open web: you get a real cover instead of a generated placeholder, and in exchange the image vanishes the moment the
other site reorganises its assets. Eight of mine had done exactly that and were returning 404.

This was supposed to be handled. The card already had a fallback:

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

The fallback never appeared. The browser drew its broken-image icon and left it there.

## The handler was attached too late

The page is server-rendered. The markup reaches the browser as HTML, the browser sees `src` and starts fetching
immediately — before any JavaScript has been evaluated. The 404 comes back in a few dozen milliseconds.

React is still busy. The bundle has to download, parse, and hydrate before a single event listener exists. `onError` in
JSX is not an `onerror` attribute on the element; it is a synthetic listener React attaches during hydration. By the
time it is attached, the `error` event has already fired and nothing is going to replay it.

So the ordering looks like this:

1. HTML arrives, browser requests the cover
2. Cover 404s, `error` fires against an element with no listeners
3. React hydrates and attaches `onError`
4. Nothing happens, forever

The gap is not a rounding error. On a phone on a mediocre connection, hydration can land hundreds of milliseconds after
the image has already failed — which is why this reproduced reliably on mobile and almost never on my laptop.

## Events are gone, but state is not

An event is a moment. Miss it and there is nothing to recover. The DOM, however, keeps the evidence of what happened,
and that evidence is still there whenever you get around to looking.

Two properties are enough to tell the three cases apart:

- **Still loading** — `complete` is `false`
- **Loaded successfully** — `complete` is `true` and `naturalWidth` is greater than `0`
- **Failed** — `complete` is `true` and `naturalWidth` is `0`

That last combination is what a broken image looks like after the fact. It is the state the missed `error` event left
behind.

## Checking instead of waiting

A ref callback runs when React commits the element, which on a hydrated tree means during the hydration pass. Note that
this is not meaningfully earlier than when `onError` gets attached — the fix is not about winning a race. The difference
is that the ref **asks** the element what happened, rather than **waiting** to be told.

```jsx
const FALLBACK_COVER = '/assets/fallback.avif'

<img
  src={bookmark.cover || FALLBACK_COVER}
  alt={bookmark.title}
  onError={(e) => {
    e.target.onerror = null
    e.target.src = FALLBACK_COVER
  }}
  ref={(node) => {
    if (node && node.complete && node.naturalWidth === 0) {
      node.onerror = null
      node.src = FALLBACK_COVER
    }
  }}
/>
```

Both handlers stay. The ref catches everything that failed before hydration; `onError` still covers everything that
fails after it, which is a real category — images below the fold, lazy-loaded covers, and connections that drop
mid-page.

## Where else this bites

Any DOM event that can fire between first paint and hydration is unreliable in a server-rendered app, and images are
only the most visible case:

- `load` and `error` on `<img>`, `<video>`, `<audio>`, and `<link>`
- Password managers autofilling an input before React knows the field exists
- A user opening a `<details>` element, or checking a checkbox, during the dead time
- Scroll position restored by the browser before your scroll listener is attached

The rule that falls out of this: **if an event can fire before hydration, do not rely on the event.** Find the state it
would have left behind, and check for it on mount.
