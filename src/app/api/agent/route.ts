import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { generateEditToken, hashToken, validateSlug, slugify } from '@/lib/utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import type { AgentCreateInput } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { success } = rateLimit(`create:${ip}`, { limit: 10, windowMs: 3600_000 })
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    const body: AgentCreateInput = await request.json()

    if (!body.name || !body.slug || !body.protocols?.length) {
      return NextResponse.json(
        { error: 'name, slug, and at least one protocol are required' },
        { status: 400 }
      )
    }

    const slug = slugify(body.slug)
    if (!validateSlug(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug. Use 3-64 lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      )
    }

    if (body.name.length > 100) {
      return NextResponse.json({ error: 'Name must be 100 characters or less' }, { status: 400 })
    }

    if (body.description && body.description.length > 500) {
      return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 })
    }

    const editToken = generateEditToken()
    const editTokenHash = hashToken(editToken)

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .insert({
        slug,
        name: body.name,
        provider: body.provider || null,
        description: body.description || null,
        avatar_url: body.avatar_url || null,
        protocols: body.protocols,
        mcp_endpoint: body.mcp_endpoint || null,
        a2a_endpoint: body.a2a_endpoint || null,
        api_endpoint: body.api_endpoint || null,
        capabilities: body.capabilities || [],
        tags: body.tags || [],
        pricing: body.pricing || null,
        website: body.website || null,
        github: body.github || null,
        raw_a2a_json: body.raw_a2a_json || null,
        edit_token_hash: editTokenHash,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'An agent with this slug already exists' },
          { status: 409 }
        )
      }
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agentid.top'

    return NextResponse.json({
      agent,
      edit_token: editToken,
      edit_url: `${appUrl}/edit/${slug}`,
    }, { status: 201 })
  } catch (err) {
    console.error('POST /api/agent error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
