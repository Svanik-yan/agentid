'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Agent } from '@/lib/types'
import { type Locale, getDictionary } from '@/lib/i18n'

const PROTOCOLS = ['A2A', 'MCP', 'API']

function generateAvatarColor(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`
}

function ProtocolBadge({ protocol }: { protocol: string }) {
  const colors: Record<string, string> = {
    A2A: 'bg-blue-100 text-blue-700',
    MCP: 'bg-emerald-100 text-emerald-700',
    API: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[protocol] || 'bg-gray-100 text-gray-700'}`}>
      {protocol}
    </span>
  )
}

function AgentCard({ agent, lang, t }: { agent: Agent; lang: string; t: ReturnType<typeof getDictionary> }) {
  const avatarColor = generateAvatarColor(agent.slug)

  return (
    <Link
      href={`/${lang}/agent/${agent.slug}`}
      className="group block rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 transition-all hover:border-[var(--color-accent)] hover:shadow-md"
    >
      <div className="mb-3 flex items-center gap-3">
        {agent.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={agent.avatar_url} alt={agent.name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {agent.name[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-[var(--color-primary)] group-hover:text-[var(--color-accent)]">
            {agent.name}
          </h3>
          {agent.provider && (
            <p className="truncate text-xs text-[var(--color-text-secondary)]">{t.by} {agent.provider}</p>
          )}
        </div>
        {agent.pricing && (
          <span className="shrink-0 rounded-full bg-[var(--color-surface-alt)] px-2 py-0.5 text-xs capitalize text-[var(--color-text-secondary)]">
            {agent.pricing}
          </span>
        )}
      </div>

      {agent.description && (
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {agent.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {agent.protocols.map((p) => (
            <ProtocolBadge key={p} protocol={p} />
          ))}
          {agent.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
              {tag}
            </span>
          ))}
        </div>
        {typeof agent.view_count === 'number' && agent.view_count > 0 && (
          <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
            {agent.view_count} {t.views}
          </span>
        )}
      </div>
    </Link>
  )
}

export default function DirectoryPage() {
  const params = useParams()
  const router = useRouter()
  const lang = (params.lang as Locale) || 'en'
  const t = getDictionary(lang)

  const [agents, setAgents] = useState<Agent[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [protocol, setProtocol] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState('newest')

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (protocol) params.set('protocol', protocol)
    if (sort !== 'newest') params.set('sort', sort)
    params.set('page', String(page))
    params.set('limit', '24')

    try {
      const res = await fetch(`/api/agents?${params}`)
      const data = await res.json()
      setAgents(data.agents || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
    } catch {
      setAgents([])
    } finally {
      setLoading(false)
    }
  }, [search, protocol, page, sort])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleProtocolFilter = (p: string) => {
    setProtocol(protocol === p ? '' : p)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-[var(--color-primary)]">{t.directoryTitle}</h1>
        <p className="text-[var(--color-text-secondary)]">{t.directoryDesc}</p>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <button
            type="submit"
            className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        <div className="flex gap-2">
          <button
            onClick={() => { setProtocol(''); setPage(1) }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              !protocol
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
            }`}
          >
            {t.allProtocols}
          </button>
          {PROTOCOLS.map((p) => (
            <button
              key={p}
              onClick={() => handleProtocolFilter(p)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                protocol === p
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {([['newest', t.sortNewest], ['views', t.sortPopular], ['name', t.sortName]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setSort(key); setPage(1) }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                sort === key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {!loading && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {total} {t.agentsCount}
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center">
          <p className="text-[var(--color-text-secondary)]">{t.loading}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && agents.length === 0 && (
        <div className="py-20 text-center">
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-primary)]">
            {search || protocol ? t.noAgentsFound : t.noAgentsFound}
          </h2>
          <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
            {search || protocol ? t.noAgentsFoundDesc : t.beTheFirst}
          </p>
          {!search && !protocol && (
            <Link
              href={`/${lang}/create`}
              className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              {t.createYourCard}
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && agents.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} lang={lang} t={t} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-alt)] disabled:opacity-50"
          >
            &larr;
          </button>
          <span className="px-3 text-sm text-[var(--color-text-secondary)]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-alt)] disabled:opacity-50"
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  )
}
