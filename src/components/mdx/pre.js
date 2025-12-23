import { CopyButton } from '@/components/copy-button'

export function Pre({ children, ...props }) {
    // Extract text content from children (which is usually a <code> element)
    const text = children?.props?.children || ''

    return (
        <pre {...props} className="group relative">
            <CopyButton text={text} />
            {children}
        </pre>
    )
}
