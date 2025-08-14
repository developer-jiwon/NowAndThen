import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  const size = 180
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #EBD2D6 0%, #E5C8CD 100%)',
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 126,
            height: 120,
            borderRadius: 24,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 36,
              background: 'linear-gradient(180deg,#DDB7BF 0%, #E7CCD2 100%)',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 24,
              width: 8,
              height: 8,
              background: '#FFFFFF',
              borderRadius: 999,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 24,
              width: 8,
              height: 8,
              background: '#FFFFFF',
              borderRadius: 999,
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {new Array(12).fill(0).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: i === 6 ? '#DDB7BF' : '#E7CCD2',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    { width: size, height: size }
  )
}


