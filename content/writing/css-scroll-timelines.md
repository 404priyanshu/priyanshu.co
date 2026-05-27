---
title: 'A Developer Guide to CSS Scroll Timelines'
date: '2025-04-12'
description: 'How to build high-performance scroll-driven animations natively in the browser using the CSS ScrollTimeline API, eliminating JavaScript main-thread scroll listeners.'
---

# A Developer Guide to CSS Scroll Timelines

For years, building scroll-linked animations—like progress bars, parallax headers, and element reveals—required attaching heavy scroll event listeners to the window or scrolling container. These listeners executed JavaScript on the main thread, resulting in layout thrashing, frame drops, and poor input responsiveness.

The introduction of native CSS Scroll Timelines changes this completely. Browsers can now link CSS animations directly to the scroll port's position, letting the browser's compositor thread manage animation rendering smoothly.

## The Core Concept

A CSS Scroll Timeline maps the progress of a scroll container (from 0% to 100% scrolled) to the timeline of a standard CSS animation (from `from` to `to` keyframes). 

There are two primary ways to declare a scroll timeline:
1. **Anonymous Timelines**: Quick definitions using the `scroll()` function.
2. **Named Timelines**: Modular definitions using the `scroll-timeline` property on a scroller and `animation-timeline` on the animated subject.

## Creating an Anonymous Timeline

The easiest way to bind an animation to scroll is the `scroll()` helper. By default, calling `scroll()` binds to the nearest scrollable ancestor in the vertical (block) axis:

```css
@keyframes scale-header {
  from {
    transform: scale(1);
    background-color: transparent;
  }
  to {
    transform: scale(0.95);
    background-color: rgba(255, 255, 255, 0.8);
  }
}

.sticky-header {
  position: sticky;
  top: 0;
  animation: scale-header linear;
  animation-timeline: scroll();
}
```

Because this timeline is anonymous, the browser handles linking the Sticky Header component to its parent scroller automatically, creating a fluid header scaling effect without executing a single line of script.

## Defining a Named Timeline

When you need to animate elements that are not direct descendants of the scroll container, or when tracking multiple scrollers, named scroll timelines are ideal.

First, define the timeline on the scrollable container:

```css
.scroll-container {
  overflow-y: scroll;
  scroll-timeline-name: --container-scroll;
  scroll-timeline-axis: block;
}
```

Next, reference this timeline name on the child or target element that should animate:

```css
.progress-indicator {
  width: 100%;
  transform-origin: left;
  animation: grow-progress linear;
  animation-timeline: --container-scroll;
}

@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

## Performance Benefits

By utilizing native CSS timelines:
- **Zero Main-Thread Block**: Animations are calculated on the compositor thread. Even if heavy JavaScript execution freezes the main thread, scroll animations continue to execute at the display's native refresh rate.
- **Improved Power Efficiency**: Mobile browsers consume significantly less battery power because they skip continuous script execution during fast scrolling swipes.
- **Graceful Degradation**: Browsers that do not yet support scroll timelines simply display the element's default initial state, keeping the interface fully functional.

CSS Scroll Timelines provide a modern, robust, and performant approach to scroll-driven motion on the web, elevating layout interactions to native-app quality.
