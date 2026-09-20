# Writing workflow

Posts live in `content/writing/` and are published automatically at `/writing/<slug>` when `main` deploys.

Every post should meet a publication-quality bar: accurate material, clear narrative structure, strong accessibility,
and visuals or animation that explain rather than decorate. Use maintained, best-fit tools when they improve the result,
but prefer the existing stack over unnecessary dependencies.

## Create a post

```bash
bun run blog:new -- \
  --slug bias-and-variance \
  --title "Bias and Variance" \
  --description "A concise description for search and social previews."
```

To copy supplied media into the correct public directory at the same time:

```bash
bun run blog:new -- \
  --slug bias-and-variance \
  --title "Bias and Variance" \
  --description "A concise description for search and social previews." \
  --asset /absolute/path/target.svg \
  --asset /absolute/path/chart.png
```

Use `--dry-run` to preview every file and the generated Markdown without writing anything.

## Add media

Use the reusable figure component for images, GIFs, and animated SVGs:

```md
<ArticleFigure
  src="/assets/writing/post-slug/diagram.svg"
  alt="A useful description of the diagram"
  caption="An optional visible caption."
  width="680"
  height="440"
/>
```

Animated SVGs keep their internal CSS or SMIL animation. Prefer `width` and `height` when known to prevent layout shift.
Plain Markdown images remain supported when a caption is unnecessary.

## Validate

During writing, check only the post you changed:

```bash
bun run blog:check -- post-slug
```

The validator checks frontmatter, dates, body content, custom article components, duplicate titles, and referenced local
assets. CI checks every post on each push and pull request.

Use the full check when shared rendering code changed:

```bash
bun run blog:verify
```

## Publish

The normal publishing path is:

1. Fetch or pull the latest `origin/main` before editing.
2. Create or edit the Markdown and assets.
3. Run `bun run blog:check -- <slug>`.
4. Commit only the intended files.
5. Push to the confirmed GitHub remote. Vercel deploys `main` automatically.

Do not force-push, and do not add a second H1—the article layout already renders the frontmatter title.
