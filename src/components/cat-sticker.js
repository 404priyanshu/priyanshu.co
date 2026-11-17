import { PeelSticker } from '@/components/peel-sticker'

// A black cat sitting with its tail curled, cut out with a white sticker border.
// Square viewBox, so the peel's fold lines up with the corner. No ids or SVG filters:
// the sticker draws this artwork twice, and duplicate ids would clash.
const BODY =
  'M47 32 L46 12 L57.5 21.5 Q65 19 72.5 21.5 L84 12 L83 32 Q87.5 44 81.5 52.5 Q90.5 66 88.5 84 Q87.5 92 78.5 92 L40 92 Q32 92 33 84 Q34 65 47.5 52.5 Q42.5 43 47 32 Z'
const TAIL = 'M38 88 C20 91 12.5 78 17 64.5 C19.5 57 24.5 53 22 45.5'

function CatArt({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* The white border: the same shapes, stroked wider, underneath. */}
      <g stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
        <path d={TAIL} strokeWidth="16" />
        <path d={BODY} fill="#fff" strokeWidth="8" />
      </g>
      <path d={TAIL} stroke="#111" strokeWidth="8.5" strokeLinecap="round" />
      <path d={BODY} fill="#111" />
      {/* Eyes, glancing to the right. */}
      <ellipse cx="57" cy="37" rx="5.2" ry="5.8" fill="#fff" />
      <ellipse cx="73" cy="37" rx="5.2" ry="5.8" fill="#fff" />
      <circle cx="58.6" cy="36.6" r="2.5" fill="#111" />
      <circle cx="74.6" cy="36.6" r="2.5" fill="#111" />
      <circle cx="59.3" cy="35.6" r="0.8" fill="#fff" />
      <circle cx="75.3" cy="35.6" r="0.8" fill="#fff" />
    </svg>
  )
}

export function CatSticker({ size = 56, className }) {
  return (
    <PeelSticker size={size} className={className}>
      <CatArt size={size} />
    </PeelSticker>
  )
}
