import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Agent } from '@/lib/types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('name, description, provider, protocols')
    .eq('slug', slug)
    .single()

  if (!agent) return { title: 'Agent Not Found — AgentID' }

  const title = `${agent.name} — AgentID`
  const description = agent.description || `${agent.name} agent card on AgentID`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `https://agentid.top/agent/${slug}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

function ProtocolBadge({ protocol }: { protocol: string }) {
  const colors: Record<string, string> = {
    A2A: 'bg-blue-100 text-blue-700',
    MCP: 'bg-emerald-100 text-emerald-700',
    API: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${colors[protocol] || 'bg-gray-100 text-gray-700'}`}>
      {protocol}
    </span>
  )
}

function generateAvatarColor(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`
}

export default async function AgentPage({ params }: Props) {
  const { slug } = await params

  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('id, slug, name, provider, description, avatar_url, protocols, mcp_endpoint, a2a_endpoint, api_endpoint, capabilities, tags, pricing, website, github, created_at')
    .eq('slug', slug)
    .single() as { data: Agent | null }

  if (!agent) {
    notFound()
  }

  const avatarColor = generateAvatarColor(agent.slug)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Card */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          {agent.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={agent.avatar_url}
              alt={agent.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {agent.name[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">{agent.name}</h1>
            {agent.provider && (
              <p className="text-sm text-[var(--color-text-secondary)]">by {agent.provider}</p>
            )}
          </div>
          {agent.pricing && (
            <span className="ml-auto rounded-full bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-medium capitalize text-[var(--color-text-secondary)]">
              {agent.pricing}
            </span>
          )}
        </div>

        {/* Description */}
        {agent.description && (
          <p className="mb-6 leading-relaxed text-[var(--color-text)]">{agent.description}</p>
        )}

        {/* Protocols */}
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">Protocols</h2>
          <div className="flex flex-wrap gap-2">
            {agent.protocols.map((p) => (
              <ProtocolBadge key={p} protocol={p} />
            ))}
          </div>
        </div>

        {/* Endpoints */}
        {(agent.a2a_endpoint || agent.mcp_endpoint || agent.api_endpoint) && (
          <div className="mb-6">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">Endpoints</h2>
            <div className="space-y-2">
              {agent.a2a_endpoint && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-700">A2A</span>
                  <code className="rounded bg-[var(--color-surface-alt)] px-2 py-0.5 text-xs font-mono text-[var(--color-text)]">
                    {agent.a2a_endpoint}
                  </code>
                </div>
              )}
              {agent.mcp_endpoint && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-emerald-700">MCP</span>
                  <code className="rounded bg-[var(--color-surface-alt)] px-2 py-0.5 text-xs font-mono text-[var(--color-text)]">
                    {agent.mcp_endpoint}
                  </code>
                </div>
              )}
              {agent.api_endpoint && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-amber-700">API</span>
                  <code className="rounded bg-[var(--color-surface-alt)] px-2 py-0.5 text-xs font-mono text-[var(--color-text)]">
                    {agent.api_endpoint}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Capabilities */}
        {agent.capabilities.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">Capabilities</h2>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((c) => (
                <span key={c} className="rounded-[var(--radius-sm)] bg-[var(--color-surface-alt)] px-2.5 py-1 text-sm text-[var(--color-text)]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {agent.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {agent.tags.map((t) => (
                <span key={t} className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-secondary)]">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {(agent.website || agent.github) && (
          <div className="flex gap-4 border-t border-[var(--color-border)] pt-6">
            {agent.website && (
              <a
                href={agent.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                Website
              </a>
            )}
            {agent.github && (
              <a
                href={agent.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                GitHub
              </a>
            )}
          </div>
        )}
      </div>

      {/* Badge */}
      <div className="mt-6 text-center">
        <p className="mb-2 text-xs text-[var(--color-text-secondary)]">Embed this badge in your README</p>
        <code className="rounded bg-[var(--color-surface-alt)] px-3 py-1.5 text-xs font-mono text-[var(--color-text-secondary)]">
          {'[![AgentID](https://agentid.top/badge/' + agent.slug + '.svg)](https://agentid.top/agent/' + agent.slug + ')'}
        </code>
      </div>

      {/* Claim CTA for unclaimed */}
      <div className="mt-4 text-center">
        <Link
          href="/create"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
        >
          Create your own Agent Card
        </Link>
      </div>
    </div>
  )
}
