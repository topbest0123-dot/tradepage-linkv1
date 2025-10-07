'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    const run = async () => {
      try {
        const hash = window.location.hash || ''
        if (hash.includes('access_token=')) {
          const p = new URLSearchParams(hash.slice(1))
          const access_token = p.get('access_token')
          const refresh_token = p.get('refresh_token')
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token })
          }
          window.history.replaceState({}, '', window.location.pathname)
        }
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        if (code) {
          await supabase.auth.exchangeCodeForSession(window.location.href)
          window.history.replaceState({}, '', window.location.pathname)
        }
      } finally {
        router.replace('/dashboard')
      }
    }
    run()
  }, [router])
  return <main style={{ padding: 24 }}>Signing you in…</main>
}
