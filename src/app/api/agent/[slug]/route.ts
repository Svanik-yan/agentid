import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { hashToken } from '@/lib/utils'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: agent, error } = await supabaseAdmin
    .from('agents')
    .select('id, slug, name, provider, description, avatar_url, protocols, mcp_endpoint, a2a_endpoint, api_endpoint, capabilities, tags, pricing, website, github, raw_a2a_json, created_at, updated_at')
    .eq('slug', slug)
    .single()

  if (error || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  return NextResponse.json(agent)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing edit token' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const tokenHash = hashToken(token)

  const { data: existing } = await supabaseAdmin
    .from('agents')
    .select('edit_token_hash')
    .eq('slug', slug)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  if (existing.edit_token_hash !== tokenHash) {
    return NextResponse.json({ error: 'Invalid edit token' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const updates: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'provider', 'description', 'avatar_url', 'protocols',
      'mcp_endpoint', 'a2a_endpoint', 'api_endpoint', 'capabilities',
      'tags', 'pricing', 'website', 'github', 'raw_a2a_json',
    ]

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    if (updates.name && (updates.name as string).length > 100) {
      return NextResponse.json({ error: 'Name must be 100 characters or less' }, { status: 400 })
    }

    if (updates.description && (updates.description as string).length > 500) {
      return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 })
    }

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .update(updates)
      .eq('slug', slug)
      .select('id, slug, name, provider, description, avatar_url, protocols, mcp_endpoint, a2a_endpoint, api_endpoint, capabilities, tags, pricing, website, github, raw_a2a_json, created_at, updated_at')
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 })
    }

    return NextResponse.json(agent)
  } catch (err) {
    console.error('PUT /api/agent/[slug] error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
