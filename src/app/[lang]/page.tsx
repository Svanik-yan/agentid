import Link from 'next/link'
import { type Locale, getDictionary } from '@/lib/i18n'

const EXAMPLE_AGENT = {
  name: 'WeatherBot',
  slug: 'weather-bot',
  provider: 'Acme AI',
  description: 'Real-time weather data for any location. Supports natural language queries and structured API calls.',
  protocols: ['A2A', 'MCP'],
  capabilities: ['weather-lookup', 'forecast', 'alerts'],
  tags: ['weather', 'data', 'utility'],
  pricing: 'freemium' as const,
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

function ExampleCard({ t }: { t: ReturnType<typeof getDictionary> }) {
  return (
    <div className="mx-auto w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ backgroundColor: 'hsl(200, 65%, 55%)' }}
        >
          W
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--color-primary)]">{EXAMPLE_AGENT.name}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">{t.by} {EXAMPLE_AGENT.provider}</p>
        </div>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {EXAMPLE_AGENT.description}
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {EXAMPLE_AGENT.protocols.map((p) => (
          <ProtocolBadge key={p} protocol={p} />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLE_AGENT.capabilities.map((c) => (
          <span key={c} className="rounded-[var(--radius-sm)] bg-[var(--color-surface-alt)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}

type Props = { params: Promise<{ lang: string }> }

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  const locale = (lang === 'zh' ? 'zh' : 'en') as Locale
  const t = getDictionary(locale)

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

      {/* Example Card */}
      <section className="mb-20">
        <div className="text-center">
          <ExampleCard t={t} />
        </div>
      </section>

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
