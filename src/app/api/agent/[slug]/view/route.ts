import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

type Props = { params: Promise<{ slug: string }> }

export async function POST(_request: Request, { params }: Props) {
  const { slug } = await params
  const ip = getClientIp(_request)
  const { success } = rateLimit(`view:${ip}:${slug}`, { limit: 5, windowMs: 60_000 })
  if (!success) {
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabaseAdmin.rpc('increment_view_count', { agent_slug: slug })

  if (error) {
    // Fallback: direct update if RPC doesn't exist yet
    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('view_count')
      .eq('slug', slug)
      .single()

    if (agent) {
      await supabaseAdmin
        .from('agents')
        .update({ view_count: (agent.view_count || 0) + 1 })
        .eq('slug', slug)
    }
  }

  return NextResponse.json({ ok: true })
}
