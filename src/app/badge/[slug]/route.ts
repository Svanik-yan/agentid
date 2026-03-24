import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { escapeXml } from '@/lib/utils'

export const revalidate = 60

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rawSlug = (await params).slug
  const slug = rawSlug.replace(/\.svg$/, '')

  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('name, protocols')
    .eq('slug', slug)
    .single()

  if (!agent) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20">
      <rect width="120" height="20" rx="3" fill="#e5e7eb"/>
      <text x="60" y="14" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6b7280">not found</text>
    </svg>`
    return new NextResponse(svg, {
      status: 404,
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=60' },
    })
  }

  const name = escapeXml(agent.name)
  const protocols = agent.protocols.map((p: string) => escapeXml(p)).join(' | ')
  const label = 'AgentID'

  const labelWidth = label.length * 6.5 + 12
  const valueText = `${name} · ${protocols}`
  const valueWidth = valueText.length * 6 + 12
  const totalWidth = labelWidth + valueWidth

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="a">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#a)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="#3B82F6"/>
    <rect width="${totalWidth}" height="20" fill="url(#b)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${valueText}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${valueText}</text>
  </g>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
