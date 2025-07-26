import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              margin: '0 0 20px 0',
              fontFamily: 'Merriweather, serif',
              letterSpacing: '-0.02em',
            }}
          >
            Now & Then
          </h1>
          <p
            style={{
              fontSize: '28px',
              color: '#666666',
              margin: '0 0 24px 0',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: '400',
              letterSpacing: '0.01em',
            }}
          >
            Countdown Timer & Deadline Tracker
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '24px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                color: '#666666',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: '400',
                letterSpacing: '0.02em',
              }}
            >
              Professional time management tool
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
} 