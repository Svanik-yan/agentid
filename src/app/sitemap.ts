import type { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import { locales } from '@/lib/i18n'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.agentid.top'

  const staticPages = locales.flatMap((lang) => [
    {
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/${lang}/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${lang}/agents`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ])

  const { data: agents } = await supabaseAdmin
    .from('agents')
    .select('slug, updated_at, created_at')
    .order('created_at', { ascending: false })

  const agentPages = (agents || []).flatMap((agent) =>
    locales.map((lang) => ({
      url: `${baseUrl}/${lang}/agent/${agent.slug}`,
      lastModified: new Date(agent.updated_at || agent.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  return [...staticPages, ...agentPages]
}
