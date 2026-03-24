'use client'

import { useEffect } from 'react'

export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/agent/${slug}/view`, { method: 'POST' }).catch(() => {})
  }, [slug])

  return null
}
