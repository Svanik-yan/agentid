import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are supported' }, { status: 400 })
    }

    // If the URL doesn't end with a known agent card path, try well-known first
    const urlsToTry: string[] = [url]
    if (!url.includes('.well-known/agent') && !url.endsWith('.json')) {
      // Try appending well-known path
      const base = url.replace(/\/+$/, '')
      urlsToTry.push(`${base}/.well-known/agent.json`)
    }

    let lastError = ''
    for (const tryUrl of urlsToTry) {
      try {
        const res = await fetch(tryUrl, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000),
        })

        if (!res.ok) {
          lastError = `HTTP ${res.status} from ${tryUrl}`
          continue
        }

        const contentType = res.headers.get('content-type') || ''
        if (!contentType.includes('json')) {
          lastError = `Not JSON (${contentType}) from ${tryUrl}`
          continue
        }

        const data = await res.json()
        return NextResponse.json({ data, source_url: tryUrl })
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Fetch failed'
        continue
      }
    }

    return NextResponse.json(
      { error: `Could not fetch agent card: ${lastError}` },
      { status: 422 }
    )
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
