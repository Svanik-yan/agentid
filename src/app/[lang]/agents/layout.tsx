import type { Metadata } from 'next'
import { type Locale, getDictionary } from '@/lib/i18n'

type Props = { params: Promise<{ lang: string }>; children: React.ReactNode }

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const t = getDictionary(lang as Locale)

  return {
    title: `${t.directoryTitle} — AgentID`,
    description: t.directoryDesc,
    openGraph: {
      title: `${t.directoryTitle} — AgentID`,
      description: t.directoryDesc,
      url: `https://www.agentid.top/${lang}/agents`,
    },
  }
}

export default function AgentsLayout({ children }: Props) {
  return <>{children}</>
}
