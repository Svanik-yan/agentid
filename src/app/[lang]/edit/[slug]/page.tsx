'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { Agent } from '@/lib/types'
import { type Locale, getDictionary } from '@/lib/i18n'

const PROTOCOLS = ['A2A', 'MCP', 'API']

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const lang = (params.lang as Locale) || 'en'
  const t = getDictionary(lang)

  const PRICING_OPTIONS = [
    { value: '', label: t.noPricing },
    { value: 'free', label: t.free },
    { value: 'freemium', label: t.freemium },
    { value: 'paid', label: t.paid },
    { value: 'enterprise', label: t.enterprise },
  ]

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
          setError(t.agentNotFoundEdit)
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
      .catch(() => setError(t.failedToLoad))
      .finally(() => setLoading(false))
  }, [slug, t.agentNotFoundEdit, t.failedToLoad])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!token) {
      setError(t.editTokenRequiredError)
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
        setError(data.error || t.failedToUpdate)
        return
      }

      setSuccess(true)
      setAgent(data)
    } catch {
      setError(t.networkError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-[var(--color-text-secondary)]">{t.loading}</p>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-[var(--color-primary)]">{t.agentNotFoundEdit}</h1>
        <p className="text-[var(--color-text-secondary)]">{t.doesntExist}</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="mb-4 text-2xl font-bold text-[var(--color-primary)]">{t.editTokenRequired}</h1>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          {t.editTokenRequiredDesc}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t.editFormat} <code className="font-mono text-xs">/edit/{slug}#token=YOUR_TOKEN</code>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Edit: {agent.name}</h1>
        <button
          onClick={() => router.push(`/${lang}/agent/${slug}`)}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          {t.viewCard}
        </button>
      </div>

      {success && (
        <div className="mb-4 rounded-[var(--radius-md)] bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {t.cardUpdated}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">{t.name}</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
        </div>

        <div>
          <label htmlFor="provider" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">{t.provider}</label>
          <input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} maxLength={100}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">{t.description}</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{description.length}/500</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-primary)]">{t.protocols}</label>
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
            <label htmlFor="a2a" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">{t.a2aEndpoint}</label>
            <input id="a2a" value={a2aEndpoint} onChange={(e) => setA2aEndpoint(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-mono text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          </div>
        )}
        {protocols.includes('MCP') && (
          <div>
            <label htmlFor="mcp" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">{t.mcpEndpoint}</label>
            <input id="mcp" value={mcpEndpoint} onChange={(e) => setMcpEndpoint(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-mono text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          </div>
        )}
        {protocols.includes('API') && (
          <div>
            <label htmlFor="api" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">{t.apiEndpoint}</label>
            <input id="api" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-mono text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          </div>
        )}

        <div>
          <label htmlFor="capabilities" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">{t.capabilities}</label>
          <input id="capabilities" value={capabilities} onChange={(e) => setCapabilities(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t.commaSeparated}</p>
        </div>

        <div>
          <label htmlFor="tags" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">{t.tags}</label>
          <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t.commaSeparated}</p>
        </div>

        <div>
          <label htmlFor="pricing" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">{t.pricing}</label>
          <select id="pricing" value={pricing} onChange={(e) => setPricing(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]">
            {PRICING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="website" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">{t.website}</label>
            <input id="website" value={website} onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          </div>
          <div>
            <label htmlFor="github" className="mb-1 block text-sm font-medium text-[var(--color-primary)]">{t.github}</label>
            <input id="github" value={github} onChange={(e) => setGithub(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]" />
          </div>
        </div>

        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

        <button type="submit" disabled={saving}
          className="w-full rounded-[var(--radius-md)] bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50">
          {saving ? t.saving : t.saveChanges}
        </button>
      </form>
    </div>
  )
}
