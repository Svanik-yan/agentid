import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="mb-3 text-3xl font-bold text-[var(--color-primary)]">404</h1>
      <p className="mb-6 text-[var(--color-text-secondary)]">
        This agent doesn&apos;t have a card yet.
      </p>
      <Link
        href="/en/create"
        className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Create a Card
      </Link>
    </div>
  )
}
