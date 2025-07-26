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
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              margin: '0 0 16px 0',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Now & Then
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: '#666666',
              margin: '0 0 24px 0',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: '400',
            }}
          >
            Countdown Timer & Deadline Tracker
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '32px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <span
              style={{
                fontSize: '24px',
                color: '#2a2a2a',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: '500',
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