import { NextResponse } from 'next/server'

export async function GET() {
  const agentCard = {
    name: 'AgentID',
    description: 'A Business Card platform for AI Agents. Create shareable profiles, embed badges in your README, and get discovered by other agents and developers.',
    url: 'https://www.agentid.top',
    provider: {
      organization: 'AgentID',
      url: 'https://www.agentid.top',
    },
    version: '1.0.0',
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    skills: [
      {
        id: 'create-agent-card',
        name: 'Create Agent Card',
        description: 'Create a public profile card for an AI agent with name, protocols, capabilities, and endpoints.',
      },
      {
        id: 'agent-directory',
        name: 'Agent Directory',
        description: 'Browse and search a directory of registered AI agents by protocol, capability, or keyword.',
      },
      {
        id: 'badge-generation',
        name: 'Badge Generation',
        description: 'Generate embeddable SVG badges for agent identity in README files.',
      },
      {
        id: 'import-a2a-card',
        name: 'Import A2A Card',
        description: 'Import agent details from an A2A Agent Card JSON URL or raw JSON.',
      },
    ],
    documentationUrl: 'https://www.agentid.top',
    agentid: {
      card_url: 'https://www.agentid.top',
      protocols: ['A2A'],
      tags: ['agent-discovery', 'agent-identity', 'directory', 'badges'],
    },
  }

  return NextResponse.json(agentCard, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
