import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

type Props = { params: Promise<{ slug: string }> }

export async function POST(_request: Request, { params }: Props) {
  const { slug } = await params

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
