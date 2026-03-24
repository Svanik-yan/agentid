import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale, type Locale } from '@/lib/i18n'

function getLocaleFromHeaders(request: NextRequest): Locale {
  const acceptLang = request.headers.get('accept-language') || ''
  if (acceptLang.includes('zh')) return 'zh'
  return defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip for API routes, static files, badges, _next
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/badge/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return
  }

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Detect locale and redirect
  const locale = getLocaleFromHeaders(request)
  const newUrl = new URL(`/${locale}${pathname}`, request.url)
  // Preserve hash/search
  newUrl.search = request.nextUrl.search
  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: ['/((?!_next|api|badge|favicon|.*\\..*).*)'],
}
