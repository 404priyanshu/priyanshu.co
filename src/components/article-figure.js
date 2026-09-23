// size="compact" caps a diagram at its drawn width instead of stretching it
// across the column, so an SVG drawn for ~520px doesn't render oversized.
export function ArticleFigure({ src, alt, caption, width, height, size, className = '' }) {
  return (
    <figure
      className={['article-figure', size === 'compact' && 'article-figure--compact', className]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        alt={alt || ''}
        decoding="async"
        height={height ? Number(height) : undefined}
        loading="lazy"
        src={src}
        width={width ? Number(width) : undefined}
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}
