import { ImageResponse } from 'next/og'
import { supabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'edge'
export const alt = 'AgentID Card'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const PROTOCOL_COLORS: Record<string, string> = {
  A2A: '#3B82F6',
  MCP: '#10B981',
  API: '#F59E0B',
}

function avatarColor(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 65%, 55%)`
}

export default async function OGImage({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug } = await params

  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('name, description, provider, protocols, capabilities, tags, pricing')
    .eq('slug', slug)
    .single()

  if (!agent) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#f9fafb', fontSize: 32, color: '#6b7280' }}>
          Agent Not Found
        </div>
      ),
      { ...size }
    )
  }

  const color = avatarColor(slug)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'white',
          padding: '60px',
        }}
      >
        {/* Top row: avatar + name + pricing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: color,
              color: 'white',
              fontSize: '36px',
              fontWeight: 700,
            }}
          >
            {agent.name[0].toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '42px', fontWeight: 700, color: '#111827' }}>
                {agent.name}
              </span>
              {agent.pricing && (
                <span style={{ fontSize: '18px', color: '#6b7280', background: '#f3f4f6', padding: '4px 12px', borderRadius: '9999px' }}>
                  {agent.pricing}
                </span>
              )}
            </div>
            {agent.provider && (
              <span style={{ fontSize: '22px', color: '#6b7280', marginTop: '4px' }}>
                by {agent.provider}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {agent.description && (
          <div style={{ fontSize: '24px', color: '#374151', lineHeight: '1.5', marginTop: '32px', maxHeight: '108px', overflow: 'hidden' }}>
            {agent.description.length > 180 ? agent.description.slice(0, 180) + '...' : agent.description}
          </div>
        )}

        {/* Protocols */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          {agent.protocols.map((p: string) => (
            <div
              key={p}
              style={{
                display: 'flex',
                padding: '6px 20px',
                borderRadius: '9999px',
                background: PROTOCOL_COLORS[p] || '#6b7280',
                color: 'white',
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              {p}
            </div>
          ))}
        </div>

        {/* Tags */}
        {agent.tags && agent.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {agent.tags.slice(0, 6).map((tag: string) => (
              <span
                key={tag}
                style={{ fontSize: '16px', color: '#6b7280', background: '#f3f4f6', padding: '4px 12px', borderRadius: '6px' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#3B82F6' }}>AgentID</span>
          <span style={{ fontSize: '18px', color: '#9ca3af' }}>www.agentid.top</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
