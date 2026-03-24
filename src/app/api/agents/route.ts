import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim() || ''
  const protocol = searchParams.get('protocol') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)))
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('agents')
    .select('id, slug, name, provider, description, avatar_url, protocols, capabilities, tags, pricing, created_at', { count: 'exact' })

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,provider.ilike.%${q}%`)
  }

  if (protocol) {
    query = query.contains('protocols', [protocol])
  }

  const { data: agents, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('GET /api/agents error:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }

  return NextResponse.json({
    agents: agents || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
