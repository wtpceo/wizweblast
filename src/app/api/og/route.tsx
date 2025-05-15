import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          background: 'linear-gradient(to bottom right, #0F0F19, #141428)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: 50,
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 40,
            background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
              marginRight: 20,
              fontSize: 40,
            }}
          >
            ⭐
          </div>
          <h1 style={{ fontSize: 70, fontWeight: 'bold' }}>WIZ WORKS</h1>
        </div>
        <h2 style={{ margin: 0, color: '#94A3B8', fontWeight: 'normal' }}>
          광고주 관리를 위한 최적의 솔루션
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 60,
          }}
        >
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              padding: 20,
              borderRadius: 12,
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <span style={{ fontSize: 30, color: '#60A5FA' }}>👥 총 광고주</span>
            <p style={{ fontSize: 60, margin: 0, fontWeight: 'bold' }}>207</p>
          </div>
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              padding: 20,
              borderRadius: 12,
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <span style={{ fontSize: 30, color: '#FBBF24' }}>⏰ 곧 종료 할 광고주</span>
            <p style={{ fontSize: 60, margin: 0, fontWeight: 'bold' }}>9</p>
          </div>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              padding: 20,
              borderRadius: 12, 
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <span style={{ fontSize: 30, color: '#34D399' }}>🎮 WIZ GAME</span>
            <p style={{ fontSize: 50, margin: 0, fontWeight: 'bold' }}>업무도 게임처럼</p>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
} 