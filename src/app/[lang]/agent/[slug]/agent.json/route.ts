import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Agent } from '@/lib/types'

type Props = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params

  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('slug', slug)
    .single() as { data: Agent | null }

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  // Build A2A-compatible Agent Card JSON
  const agentCard: Record<string, unknown> = {
    name: agent.name,
    description: agent.description || '',
    url: agent.a2a_endpoint || `https://www.agentid.top/en/agent/${agent.slug}`,
    ...(agent.provider && {
      provider: {
        organization: agent.provider,
        url: agent.website || undefined,
      },
    }),
    version: '1.0.0',
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    skills: agent.capabilities.map((cap) => ({
      id: cap,
      name: cap,
    })),
    // AgentID extensions
    agentid: {
      slug: agent.slug,
      card_url: `https://www.agentid.top/en/agent/${agent.slug}`,
      badge_url: `https://www.agentid.top/badge/${agent.slug}.svg`,
      protocols: agent.protocols,
      tags: agent.tags,
      pricing: agent.pricing,
      ...(agent.github && { github: agent.github }),
      ...(agent.mcp_endpoint && { mcp_endpoint: agent.mcp_endpoint }),
      ...(agent.api_endpoint && { api_endpoint: agent.api_endpoint }),
    },
  }

  // Include raw A2A JSON if the agent was imported from one
  if (agent.raw_a2a_json) {
    agentCard._original = agent.raw_a2a_json
  }

  return NextResponse.json(agentCard, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
