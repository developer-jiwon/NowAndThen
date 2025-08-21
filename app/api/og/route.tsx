import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F6FAF7' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 72 }}>
          <div style={{ fontSize: 92, fontFamily: 'Merriweather, ui-serif, Georgia, serif', fontWeight: 900, letterSpacing: '-0.02em', color: '#213226' }}>Now & Then</div>
          <div style={{ height: 12 }} />
          <div style={{ fontSize: 28, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial', color: '#3A5A38', opacity: 0.95 }}>Smart countdowns for meaningful moments</div>
          <div style={{ height: 28 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            {['D-day', 'Reminders', 'Milestones'].map((t) => (
              <div key={t} style={{ fontSize: 20, background: '#ffffff', border: '1px solid #D9E8D9', color: '#2E5130', padding: '10px 16px', borderRadius: 999 }}>{t}</div>
            ))}
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