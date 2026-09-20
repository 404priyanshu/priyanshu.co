export function ArticleFigure({ src, alt, caption, width, height, className = '' }) {
  return (
    <figure className={`article-figure ${className}`.trim()}>
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
