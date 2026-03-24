import { Header } from '@/components/header'
import { locales, type Locale, getDictionary } from '@/lib/i18n'
import type { Metadata } from 'next'

type Props = { params: Promise<{ lang: string }>; children: React.ReactNode }

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const t = getDictionary(lang as Locale)
  return {
    title: t.siteTitle,
    description: t.siteDescription,
  }
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : 'en'

  return (
    <>
      <Header lang={locale} />
      <main>{children}</main>
    </>
  )
}
