'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { Agent } from '@/lib/types'

const PROTOCOLS = ['A2A', 'MCP', 'API']
const PRICING_OPTIONS = [
  { value: '', label: 'No pricing' },
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'enterprise', label: 'Enterprise' },
]

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [token, setToken] = useState('')
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('')
  const [description, setDescription] = useState('')
  const [protocols, setProtocols] = useState<string[]>([])
  const [mcpEndpoint, setMcpEndpoint] = useState('')
  const [a2aEndpoint, setA2aEndpoint] = useState('')
  const [apiEndpoint, setApiEndpoint] = useState('')
  const [capabilities, setCapabilities] = useState('')
  const [tags, setTags] = useState('')
  const [pricing, setPricing] = useState('')
  const [website, setWebsite] = useState('')
  const [github, setGithub] = useState('')

  // Extract token from fragment + load agent
  useEffect(() => {
    const hash = window.location.hash
    const match = hash.match(/token=([^&]+)/)
    if (match) {
      setToken(match[1])
      history.replaceState(null, '', window.location.pathname)
    }

    fetch(`/api/agent/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError('Agent not found')
        } else {
          setAgent(data)
          setName(data.name || '')
          setProvider(data.provider || '')
          setDescription(data.description || '')
          setProtocols(data.protocols || [])
          setMcpEndpoint(data.mcp_endpoint || '')
          setA2aEndpoint(data.a2a_endpoint || '')
          setApiEndpoint(data.api_endpoint || '')
          setCapabilities((data.capabilities || []).join(', '))
          setTags((data.tags || []).join(', '))
          setPricing(data.pricing || '')
          setWebsite(data.website || '')
          setGithub(data.github || '')
        }
      })
      .catch(() => setError('Failed to load agent'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!token) {
      setError('Edit token is required. Use the edit link you received when creating the card.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/agent/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          provider: provider.trim() || null,
          description: description.trim() || null,
          protocols,
          mcp_endpoint: mcpEndpoint.trim() || null,
          a2a_endpoint: a2aEndpoint.trim() || null,
          api_endpoint: apiEndpoint.trim() || null,
          capabilities: capabilities.split(',').map((c) => c.trim()).filter(Boolean),
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          pricing: pricing || null,
          website: website.trim() || null,
          github: github.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update')
        return
      }

      setSuccess(true)
      setAgent(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-[var(--color-primary)]">Agent Not Found</h1>
        <p className="text-[var(--color-text-secondary)]">This agent doesn&apos;t exist yet.</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="mb-4 text-2xl font-bold text-[var(--color-primary)]">Edit Token Required</h1>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          To edit this card, use the edit link you received when you created it. The link contains your edit token in the URL fragment.
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Format: <code className="font-mono text-xs">/edit/{slug}#token=YOUR_TOKEN</code>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Edit: {agent.name}</h1>
        <button
          onClick={() => router.push(`/agent/${slug}`)}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          View Card
        </button>
      </div>

      {success && (
        <div className="mb-4 rounded-[var(--radius-md)] bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Card updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
        </div>

        <div>
          <label htmlFor="provider" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Provider</label>
          <input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} maxLength={100}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{description.length}/500</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-primary)]">Protocols</label>
          <div className="flex gap-2">
            {PROTOCOLS.map((p) => (
              <button key={p} type="button"
                onClick={() => setProtocols((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  protocols.includes(p)
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {protocols.includes('A2A') && (
          <div>
            <label htmlFor="a2a" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">A2A Endpoint</label>
            <input id="a2a" value={a2aEndpoint} onChange={(e) => setA2aEndpoint(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-mono text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          </div>
        )}
        {protocols.includes('MCP') && (
          <div>
            <label htmlFor="mcp" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">MCP Endpoint</label>
            <input id="mcp" value={mcpEndpoint} onChange={(e) => setMcpEndpoint(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-mono text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          </div>
        )}
        {protocols.includes('API') && (
          <div>
            <label htmlFor="api" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">API Endpoint</label>
            <input id="api" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-mono text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          </div>
        )}

        <div>
          <label htmlFor="capabilities" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Capabilities</label>
          <input id="capabilities" value={capabilities} onChange={(e) => setCapabilities(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Comma-separated</p>
        </div>

        <div>
          <label htmlFor="tags" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Tags</label>
          <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Comma-separated</p>
        </div>

        <div>
          <label htmlFor="pricing" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Pricing</label>
          <select id="pricing" value={pricing} onChange={(e) => setPricing(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]">
            {PRICING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="website" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Website</label>
            <input id="website" value={website} onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          </div>
          <div>
            <label htmlFor="github" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">GitHub</label>
            <input id="github" value={github} onChange={(e) => setGithub(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          </div>
        </div>

        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

        <button type="submit" disabled={saving}
          className="w-full rounded-[var(--radius-md)] bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
