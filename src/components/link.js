import NextLink from 'next/link'

import { isExternalLink } from '@/lib/utils'

export const Link = ({ href = '#', ...rest }) => {
  const isExternal = isExternalLink(href)
  if (isExternal) {
    return (
      <a
        href={href + '?ref=priyanshu.co'}
        target="_blank"
        rel="noopener noreferrer"
        className="link break-words after:content-['_↗']"
        {...rest}
      />
    )
  }

  return <NextLink href={href} className="link" {...rest} />
}
