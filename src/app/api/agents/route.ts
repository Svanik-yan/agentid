import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const { success } = rateLimit(`agents:${ip}`, { limit: 60, windowMs: 60_000 })
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim() || ''
  const protocol = searchParams.get('protocol') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)))
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('agents')
    .select('id, slug, name, provider, description, avatar_url, protocols, capabilities, tags, pricing, view_count, created_at', { count: 'exact' })

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,provider.ilike.%${q}%`)
  }

  if (protocol) {
    query = query.contains('protocols', [protocol])
  }

  const sort = searchParams.get('sort') || 'newest'
  if (sort === 'views') {
    query = query.order('view_count', { ascending: false, nullsFirst: false })
  } else if (sort === 'name') {
    query = query.order('name', { ascending: true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: agents, count, error } = await query
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
