'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Locale, getDictionary, locales } from '@/lib/i18n'

export function Header({ lang }: { lang: Locale }) {
  const pathname = usePathname()
  const t = getDictionary(lang)
  const isCreatePage = pathname.endsWith('/create')

  // Build language switch URL: replace /en/ or /zh/ prefix
  const switchLocale = (target: Locale) => {
    const segments = pathname.split('/')
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = target
    }
    return segments.join('/')
  }

  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={`/${lang}`} className="text-lg font-semibold text-[var(--color-primary)]">
          {t.brandName}
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/${lang}/agents`}
            className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
          >
            {t.directory}
          </Link>
          {/* Language Switcher */}
          <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-1 py-0.5 text-xs">
            {locales.map((l) => (
              <Link
                key={l}
                href={switchLocale(l)}
                className={`rounded-full px-2 py-0.5 transition-colors ${
                  l === lang
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'
                }`}
              >
                {l === 'en' ? 'EN' : '中'}
              </Link>
            ))}
          </div>
          {!isCreatePage && (
            <Link
              href={`/${lang}/create`}
              className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              {t.createYourCard}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
