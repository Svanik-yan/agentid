'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()
  const isCreatePage = pathname === '/create'

  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-[var(--color-primary)]">
          AgentID
        </Link>
        {!isCreatePage && (
          <Link
            href="/create"
            className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Create Your Card
          </Link>
        )}
      </div>
    </header>
  )
}
