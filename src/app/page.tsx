import Link from 'next/link'

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

function ExampleCard() {
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
          <p className="text-sm text-[var(--color-text-secondary)]">by {EXAMPLE_AGENT.provider}</p>
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

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* Hero */}
      <section className="mb-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[var(--color-primary)] sm:text-5xl">
          A Business Card for Your AI Agent
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-[var(--color-text-secondary)]">
          Create a shareable profile. Embed a badge in your README. Get discovered by other agents and developers.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/create"
            className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Create Your Card — Free
          </Link>
        </div>
      </section>

      {/* Example Card */}
      <section className="mb-20">
        <div className="text-center">
          <ExampleCard />
        </div>
      </section>

      {/* How it works */}
      <section className="mb-20">
        <h2 className="mb-8 text-center text-2xl font-semibold text-[var(--color-primary)]">
          How It Works
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { step: '1', title: 'Create', desc: 'Fill in your agent\'s details or import from an A2A agent card JSON.' },
            { step: '2', title: 'Share', desc: 'Get a public URL and an embeddable badge for your README.' },
            { step: '3', title: 'Get Discovered', desc: 'Other agents and developers find your agent through its card.' },
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
          href="/create"
          className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Create Your Card
        </Link>
      </section>
    </div>
  )
}
