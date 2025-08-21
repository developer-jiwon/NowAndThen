import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', background: '#F6FAF7' }}>
        {/* left brand panel (green vibe) */}
        <div style={{ flex: 1.1, background: 'radial-gradient(1200px 500px at -200px -200px, #CFE6CF 0%, #F6FAF7 60%)', padding: 64, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 56, fontFamily: 'Merriweather, serif', fontWeight: 900, letterSpacing: '-0.02em', color: '#1f2937' }}>Now & Then</div>
          <div style={{ height: 10 }} />
          <div style={{ height: 6, width: 220, background: '#4E724C', borderRadius: 999 }} />
          <div style={{ height: 18 }} />
          <div style={{ fontSize: 26, fontFamily: 'Inter, system-ui, sans-serif', color: '#374151' }}>Countdowns for goals, events and moments.</div>
          <div style={{ height: 22 }} />
          <div style={{ display: 'flex', gap: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div style={{ fontSize: 18, background: '#ffffff', border: '1px solid #D1E5D1', color: '#2E5130', padding: '6px 12px', borderRadius: 999 }}>D‑day</div>
            <div style={{ fontSize: 18, background: '#ffffff', border: '1px solid #D1E5D1', color: '#2E5130', padding: '6px 12px', borderRadius: 999 }}>Reminders</div>
            <div style={{ fontSize: 18, background: '#ffffff', border: '1px solid #D1E5D1', color: '#2E5130', padding: '6px 12px', borderRadius: 999 }}>Milestones</div>
          </div>
        </div>
        {/* right card preview */}
        <div style={{ flex: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 540, height: 320, background: '#ffffff', color: '#1f2937', borderRadius: 28, border: '1px solid #E5F0E5', boxShadow: '0 10px 30px rgba(78,114,76,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 40, fontFamily: 'Merriweather, serif', fontWeight: 800, color: '#2E5130' }}>08:30 Reminder</div>
            <div style={{ height: 8 }} />
            <div style={{ fontSize: 18, fontFamily: 'Inter, system-ui, sans-serif', color: '#4B5563' }}>“Track what matters — past & future.”</div>
            <div style={{ height: 18 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: '#4E724C' }} />
              <div style={{ width: 10, height: 10, borderRadius: 999, background: '#8DB48A' }} />
              <div style={{ width: 10, height: 10, borderRadius: 999, background: '#D1E5D1' }} />
            </div>
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