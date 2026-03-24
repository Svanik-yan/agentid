'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { type Locale, getDictionary } from '@/lib/i18n'

export default function SuccessPage() {
  const params = useParams()
  const slug = params.slug as string
  const lang = (params.lang as Locale) || 'en'
  const t = getDictionary(lang)

  const [editToken, setEditToken] = useState('')
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash
    const match = hash.match(/token=([^&]+)/)
    if (match) {
      setEditToken(match[1])
      history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://www.agentid.top'

  const cardUrl = `${appUrl}/${lang}/agent/${slug}`
  const editUrl = `${appUrl}/${lang}/edit/${slug}#token=${editToken}`
  const badgeUrl = `${appUrl}/badge/${slug}.svg`
  const badgeMarkdown = `[![AgentID](${badgeUrl})](${cardUrl})`

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      {/* Step 1: Celebration */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[var(--color-primary)]">{t.cardIsLive}</h1>
        <p className="text-[var(--color-text-secondary)]">
          <Link href={cardUrl} className="text-[var(--color-accent)] underline hover:no-underline">
            {cardUrl}
          </Link>
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                s === step
                  ? 'bg-[var(--color-accent)] text-white'
                  : s < step
                  ? 'bg-[var(--color-success)] text-white'
                  : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]'
              }`}
            >
              {s < step ? '\u2713' : s}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-[var(--color-primary)]">{t.saveEditToken}</h2>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              {t.saveEditTokenDesc}
            </p>
            <div className="mb-4 rounded-[var(--radius-sm)] bg-[var(--color-surface-alt)] p-3">
              <code className="block break-all text-sm font-mono text-[var(--color-primary)]">
                {editToken || t.loading}
              </code>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(editToken, 'token')}
                className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-alt)]"
              >
                {copied === 'token' ? t.copied : t.copyToken}
              </button>
              <button
                onClick={() => copyToClipboard(editUrl, 'editUrl')}
                className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-alt)]"
              >
                {copied === 'editUrl' ? t.copied : t.copyEditLink}
              </button>
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-4 w-full rounded-[var(--radius-md)] bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              {t.savedNext}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-[var(--color-primary)]">{t.embedBadge}</h2>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              {t.embedBadgeDesc}
            </p>
            {/* Badge preview */}
            <div className="mb-4 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-alt)] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={badgeUrl} alt="AgentID Badge" height={20} />
            </div>
            <div className="mb-4 rounded-[var(--radius-sm)] bg-[var(--color-surface-alt)] p-3">
              <code className="block break-all text-xs font-mono text-[var(--color-primary)]">
                {badgeMarkdown}
              </code>
            </div>
            <button
              onClick={() => copyToClipboard(badgeMarkdown, 'badge')}
              className="mb-3 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-alt)]"
            >
              {copied === 'badge' ? t.copied : t.copyMarkdown}
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-full rounded-[var(--radius-md)] bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              {t.next}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 text-center">
            <h2 className="mb-3 text-lg font-semibold text-[var(--color-primary)]">{t.allSet}</h2>
            <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
              {t.allSetDesc}
            </p>
            <div className="flex gap-3">
              <Link
                href={cardUrl}
                className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                {t.viewCard}
              </Link>
              <Link
                href={`/${lang}/create`}
                className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-surface-alt)]"
              >
                {t.createAnother}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
