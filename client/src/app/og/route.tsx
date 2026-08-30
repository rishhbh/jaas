import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#0a0a0c',
          padding: '60px',
          fontFamily: 'monospace',
          border: '12px solid #FFEB3B',
        }}
      >
        {/* Header badges */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              backgroundColor: '#FFEB3B',
              color: '#000000',
              padding: '8px 16px',
              fontSize: '20px',
              fontWeight: 900,
              border: '3px solid #000000',
            }}
          >
            JaaS ENGINE v2.0
          </div>
          <div
            style={{
              backgroundColor: '#2196F3',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '20px',
              fontWeight: 900,
              border: '3px solid #000000',
            }}
          >
            GROQ GPT-OSS-120B
          </div>
        </div>

        {/* Main Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-2px',
              lineHeight: 1.0,
              textTransform: 'uppercase',
            }}
          >
            BRUTAL AI <span style={{ color: '#FFEB3B', marginLeft: '16px' }}>REPOSITORY</span> & README JUDGE
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#A0A0B0',
              maxWidth: '900px',
              lineHeight: 1.4,
            }}
          >
            Unhinged, high-velocity technical critique engine for GitHub repositories. Powered by Groq AI, Bun runtime, and Upstash Redis.
          </div>
        </div>

        {/* Metrics Footer */}
        <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
          <div
            style={{
              backgroundColor: '#16161a',
              border: '3px solid #FFFFFF',
              color: '#FFEB3B',
              padding: '12px 24px',
              fontSize: '20px',
              fontWeight: 900,
            }}
          >
            CACHE TTL: 24 HOURS
          </div>
          <div
            style={{
              backgroundColor: '#16161a',
              border: '3px solid #FFFFFF',
              color: '#2196F3',
              padding: '12px 24px',
              fontSize: '20px',
              fontWeight: 900,
            }}
          >
            AUTH QUOTA: 67 / DAY
          </div>
          <div
            style={{
              backgroundColor: '#16161a',
              border: '3px solid #FFFFFF',
              color: '#FF5252',
              padding: '12px 24px',
              fontSize: '20px',
              fontWeight: 900,
            }}
          >
            GUEST TRIAL: 1 ROAST
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
