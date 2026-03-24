import Link from 'next/link'
import { type Locale, getDictionary } from '@/lib/i18n'
import { supabaseAdmin } from '@/lib/supabase-server'

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

function generateAvatarColor(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`
}

type Props = { params: Promise<{ lang: string }> }

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  const locale = (lang === 'zh' ? 'zh' : 'en') as Locale
  const t = getDictionary(locale)

  const { data: agents, count } = await supabaseAdmin
    .from('agents')
    .select('id, slug, name, provider, description, avatar_url, protocols, capabilities, tags, pricing, view_count', { count: 'exact' })
    .order('view_count', { ascending: false, nullsFirst: false })
    .limit(6)

  const featured = agents || []
  const totalCount = count || 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* Hero */}
      <section className="mb-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[var(--color-primary)] sm:text-5xl">
          {t.heroTitle}
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-[var(--color-text-secondary)]">
          {t.heroDescription}
        </p>
        {totalCount > 0 && (
          <p className="mb-6 text-sm font-medium text-[var(--color-accent)]">
            {totalCount} {t.totalAgentsRegistered}
          </p>
        )}
        <div className="flex justify-center gap-3">
          <Link
            href={`/${locale}/create`}
            className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            {t.heroButton}
          </Link>
          <Link
            href={`/${locale}/agents`}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-6 py-3 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface-alt)]"
          >
            {t.directory}
          </Link>
        </div>
      </section>

      {/* Featured Agents */}
      {featured.length > 0 && (
        <section className="mb-20">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[var(--color-primary)]">
              {t.featuredAgents}
            </h2>
            <Link
              href={`/${locale}/agents`}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              {t.viewAll} &rarr;
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((agent) => {
              const avatarColor = generateAvatarColor(agent.slug)
              return (
                <Link
                  key={agent.id}
                  href={`/${locale}/agent/${agent.slug}`}
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
                  </div>
                  {agent.description && (
                    <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {agent.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {agent.protocols.map((p: string) => (
                      <ProtocolBadge key={p} protocol={p} />
                    ))}
                    {agent.tags.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="mb-20">
        <h2 className="mb-8 text-center text-2xl font-semibold text-[var(--color-primary)]">
          {t.howItWorks}
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { step: '1', title: t.step1Title, desc: t.step1Desc },
            { step: '2', title: t.step2Title, desc: t.step2Desc },
            { step: '3', title: t.step3Title, desc: t.step3Desc },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white">
                {item.step}
              </div>
              <h3 className="mb-1 font-semibold text-[var(--color-primary)]">{item.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center">
        <Link
          href={`/${locale}/create`}
          className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          {t.createYourCard}
        </Link>
      </section>
    </div>
  )
}
