export interface Agent {
  id: string
  slug: string
  name: string
  provider: string | null
  description: string | null
  avatar_url: string | null
  protocols: string[]
  mcp_endpoint: string | null
  a2a_endpoint: string | null
  api_endpoint: string | null
  capabilities: string[]
  tags: string[]
  pricing: string | null
  website: string | null
  github: string | null
  raw_a2a_json: Record<string, unknown> | null
  view_count: number
  created_at: string
  updated_at: string
}

export interface AgentCreateInput {
  slug: string
  name: string
  provider?: string
  description?: string
  avatar_url?: string
  protocols: string[]
  mcp_endpoint?: string
  a2a_endpoint?: string
  api_endpoint?: string
  capabilities: string[]
  tags: string[]
  pricing?: string
  website?: string
  github?: string
  raw_a2a_json?: Record<string, unknown>
}

export interface AgentCreateResponse {
  agent: Agent
  edit_token: string
  edit_url: string
}
