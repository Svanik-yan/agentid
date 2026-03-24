'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Agent } from '@/lib/types'

const PROTOCOLS = ['A2A', 'MCP', 'API']
const PRICING_OPTIONS = [
  { value: '', label: 'Select pricing...' },
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'enterprise', label: 'Enterprise' },
]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64)
}

function generateAvatarColor(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`
}

type Tab = 'manual' | 'import'

export default function CreatePage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('manual')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
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
  const [jsonInput, setJsonInput] = useState('')

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlug(slugify(name))
    }
  }, [name, slugManuallyEdited])

  const toggleProtocol = useCallback((p: string) => {
    setProtocols((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }, [])

  const handleJsonImport = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonInput)
      // Support A2A Agent Card format
      const card = parsed.card || parsed
      if (card.name) setName(card.name)
      if (card.description) setDescription(card.description)
      if (card.provider?.organization) setProvider(card.provider.organization)
      if (card.url) setA2aEndpoint(card.url)
      if (card.capabilities?.streaming || card.capabilities) {
        setProtocols(['A2A'])
      }
      if (card.skills) {
        setCapabilities(card.skills.map((s: { name: string }) => s.name).join(', '))
      }
      setTab('manual')
      setError('')
    } catch {
      setError('Invalid JSON. Please paste a valid A2A Agent Card JSON.')
    }
  }, [jsonInput])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Agent name is required')
      return
    }
    if (!slug.trim()) {
      setError('Slug is required')
      return
    }
    if (protocols.length === 0) {
      setError('Select at least one protocol')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          provider: provider.trim() || undefined,
          description: description.trim() || undefined,
          protocols,
          mcp_endpoint: mcpEndpoint.trim() || undefined,
          a2a_endpoint: a2aEndpoint.trim() || undefined,
          api_endpoint: apiEndpoint.trim() || undefined,
          capabilities: capabilities.split(',').map((c) => c.trim()).filter(Boolean),
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          pricing: pricing || undefined,
          website: website.trim() || undefined,
          github: github.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create agent')
        return
      }

      // Navigate to success page with token in fragment
      router.push(`/success/${data.agent.slug}#token=${data.edit_token}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Live preview data
  const previewAgent: Partial<Agent> = {
    name: name || 'Your Agent',
    slug: slug || 'your-agent',
    provider: provider || null,
    description: description || null,
    protocols: protocols.length > 0 ? protocols : ['A2A'],
    capabilities: capabilities.split(',').map((c) => c.trim()).filter(Boolean),
    tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    pricing: pricing || null,
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-primary)]">Create Your Agent Card</h1>

      {/* Tab Switch */}
      <div className="mb-6 flex gap-1 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] p-1 w-fit">
        <button
          onClick={() => setTab('manual')}
          className={`rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'manual' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-text-secondary)]'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setTab('import')}
          className={`rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'import' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-text-secondary)]'
          }`}
        >
          Import JSON
        </button>
      </div>

      {tab === 'import' ? (
        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium text-[var(--color-primary)]">
            Paste A2A Agent Card JSON
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"name": "MyAgent", "description": "...", "skills": [...]}'
            rows={10}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 font-mono text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          {error && <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>}
          <button
            onClick={handleJsonImport}
            className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Import & Fill Form
          </button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">
                Agent Name <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="WeatherBot"
                maxLength={100}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">
                Slug <span className="text-[var(--color-error)]">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-secondary)]">agentid.top/agent/</span>
                <input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value)
                    setSlugManuallyEdited(true)
                  }}
                  placeholder="weather-bot"
                  maxLength={64}
                  className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-mono text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
            </div>

            {/* Provider */}
            <div>
              <label htmlFor="provider" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Provider</label>
              <input
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Acme AI"
                maxLength={100}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does your agent do?"
                rows={3}
                maxLength={500}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{description.length}/500</p>
            </div>

            {/* Protocols */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-primary)]">
                Protocols <span className="text-[var(--color-error)]">*</span>
              </label>
              <div className="flex gap-2">
                {PROTOCOLS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleProtocol(p)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      protocols.includes(p)
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoints */}
            {protocols.includes('A2A') && (
              <div>
                <label htmlFor="a2a" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">A2A Endpoint</label>
                <input
                  id="a2a"
                  value={a2aEndpoint}
                  onChange={(e) => setA2aEndpoint(e.target.value)}
                  placeholder="https://example.com/.well-known/agent-card.json"
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-mono text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
            )}
            {protocols.includes('MCP') && (
              <div>
                <label htmlFor="mcp" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">MCP Endpoint</label>
                <input
                  id="mcp"
                  value={mcpEndpoint}
                  onChange={(e) => setMcpEndpoint(e.target.value)}
                  placeholder="https://example.com/mcp"
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-mono text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
            )}
            {protocols.includes('API') && (
              <div>
                <label htmlFor="api" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">API Endpoint</label>
                <input
                  id="api"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://api.example.com/v1"
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-mono text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
            )}

            {/* Capabilities */}
            <div>
              <label htmlFor="capabilities" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Capabilities</label>
              <input
                id="capabilities"
                value={capabilities}
                onChange={(e) => setCapabilities(e.target.value)}
                placeholder="weather-lookup, forecast, alerts"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Comma-separated</p>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Tags</label>
              <input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="weather, data, utility"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Comma-separated</p>
            </div>

            {/* Pricing */}
            <div>
              <label htmlFor="pricing" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Pricing</label>
              <select
                id="pricing"
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              >
                {PRICING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Website & GitHub */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="website" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">Website</label>
                <input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
              <div>
                <label htmlFor="github" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">GitHub</label>
                <input
                  id="github"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
            </div>

            {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

            {/* Sticky Publish Bar */}
            <div className="sticky bottom-0 -mx-4 border-t border-[var(--color-border)] bg-white px-4 py-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-[var(--radius-md)] bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish Card'}
              </button>
            </div>
          </form>

          {/* Live Preview */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                Live Preview
              </p>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: generateAvatarColor(previewAgent.slug || '') }}
                  >
                    {(previewAgent.name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--color-primary)]">{previewAgent.name}</h3>
                    {previewAgent.provider && (
                      <p className="text-sm text-[var(--color-text-secondary)]">by {previewAgent.provider}</p>
                    )}
                  </div>
                </div>
                {previewAgent.description && (
                  <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {previewAgent.description}
                  </p>
                )}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {previewAgent.protocols?.map((p) => (
                    <span
                      key={p}
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p === 'A2A' ? 'bg-blue-100 text-blue-700' :
                        p === 'MCP' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                {previewAgent.capabilities && previewAgent.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {previewAgent.capabilities.map((c) => (
                      <span key={c} className="rounded-[var(--radius-sm)] bg-[var(--color-surface-alt)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
