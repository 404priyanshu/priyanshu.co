import { readFile } from 'node:fs/promises'

import { ImageResponse } from 'next/og'

import { sharedMetadata } from '@/app/shared-metadata'
import { getBoldFont, getRegularFont } from '@/lib/fonts'

export const alt = `${sharedMetadata.title}, full-stack and backend developer. Open to work.`
export const size = {
  width: sharedMetadata.ogImage.width,
  height: sharedMetadata.ogImage.height
}
export const contentType = sharedMetadata.ogImage.type

// The home page's look in a link preview: the warm canvas, a white-rimmed card, the
// "Open to work" badge and a highlighter mark. Satori needs display: flex on any div
// with more than one child.
export default async function Image() {
  const [regularFontData, boldFontData, avatar] = await Promise.all([
    getRegularFont(),
    getBoldFont(),
    readFile('public/assets/me.jpg')
  ])
  const avatarSrc = `data:image/jpeg;base64,${avatar.toString('base64')}`

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: 48,
        backgroundColor: '#f2f2ef',
        fontFamily: 'Geist Sans'
      }}
    >
      <div
        style={{
          display: 'flex',
          flex: 1,
          padding: 12,
          borderRadius: 44,
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 24px 48px -16px rgba(0,0,0,0.12)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            padding: '44px 52px',
            borderRadius: 34,
            backgroundColor: '#f8f8f5'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <img
                src={avatarSrc}
                width={72}
                height={72}
                alt=""
                style={{ borderRadius: 9999, border: '4px solid #ffffff', objectFit: 'cover' }}
              />
              <span style={{ fontSize: 36, fontWeight: 500, color: '#111827' }}>Priyanshu Singh</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '10px 24px 10px 20px',
                borderRadius: 9999,
                backgroundColor: '#e6f1e8',
                border: '2px solid #cfe3d3',
                color: '#2f6b45',
                fontSize: 26,
                fontWeight: 500
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 9999, backgroundColor: '#3f8a55' }} />
              Open to work
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 58,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: '#111827',
                whiteSpace: 'nowrap'
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  backgroundColor: '#fff2a8',
                  borderRadius: 8,
                  padding: '0 12px',
                  margin: '0 -4px'
                }}
              >
                Full-stack & backend
              </span>
              <span style={{ marginLeft: 18, flexShrink: 0 }}>developer.</span>
            </div>
            <span style={{ fontSize: 36, color: '#6b7280' }}>
              I build for the web, and for everything that runs behind it.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 28, color: '#6b7280' }}>Full-time or internship · Remote or India</span>
            <span
              style={{
                padding: '12px 26px',
                borderRadius: 9999,
                backgroundColor: '#111827',
                color: '#ffffff',
                fontSize: 28
              }}
            >
              priyanshu.co
            </span>
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Geist Sans', data: regularFontData, style: 'normal', weight: 400 },
        { name: 'Geist Sans', data: boldFontData, style: 'normal', weight: 500 }
      ]
    }
  )
}
