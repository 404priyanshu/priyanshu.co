# Repository workflow

## Blog posts

Use this path for requests to write, add, validate, or publish a post.

### Quality bar

- Produce publication-quality material: verify technical claims, improve structure and narrative flow, preserve the
  author's voice, and make every visual teach something the prose cannot communicate as clearly.
- Use the strongest appropriate installed skill, plugin, library, or native browser capability when it materially
  improves the result. Prefer proven, maintained tools and the repository's existing stack; do not add a dependency
  merely to make the implementation look sophisticated.
- Treat animation as explanatory design. Motion should clarify sequence, comparison, causality, or state; feel smooth
  and intentional; avoid layout shift and main-thread scroll work; and include a useful static state under
  `prefers-reduced-motion`.
- For custom visuals, check desktop and mobile framing, legibility, timing, color contrast, captions, alternative text,
  and production performance. Quality takes priority over speed, but do not repeat checks that the automated pipeline
  already covers.

1. If the user asks to publish or push, fetch `origin/main` before editing so the work starts from the latest deployment
   state. Never force-push.
2. Treat a standard post as a content task inside the existing design system. Do not generate a new visual concept,
   redesign the article page, or run exhaustive browser QA unless the user asks for a redesign or the post introduces a
   genuinely new interactive component.
3. Scaffold posts with:

   ```bash
   bun run blog:new -- --slug post-slug --title "Post title" --description "Search description"
   ```

   Add one or more supplied assets with repeated `--asset /absolute/path/to/file` arguments. Assets are copied to
   `public/assets/writing/<slug>/`, and image snippets are added to the draft automatically.

4. Keep normal post work to Markdown plus the reusable `<ArticleFigure>` component. Do not add article-specific React or
   CSS for ordinary images, GIFs, or animated SVGs. The SVG may contain its own animation; `<ArticleFigure>` preserves
   it.
5. The article page already renders the title. Do not repeat it as an H1 in the Markdown body.
6. Run `bun run blog:check -- <slug>` while editing. For content-only changes, that validator plus a single local page
   render is sufficient. Run `bun run blog:verify` when the renderer, shared styles, or a custom interactive visual
   changes.
   - Next.js 16 development mode may log an internal “script tag while rendering React component” warning after client
     navigation. Do not chase it as a post regression when a fresh direct page load is clean and the production build
     passes.
7. Before committing, run `git diff --check` and confirm only intended post, asset, or renderer files changed. When the
   user explicitly asks to push, commit those files and push normally to the confirmed remote.

The detailed authoring guide is in `content/README.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
