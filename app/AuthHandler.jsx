'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 1) Handle implicit (hash) flow: #access_token=...&refresh_token=...
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => {
          // Clean the URL (remove hash) and send user to dashboard
          const clean = window.location.origin + (pathname || '/')
          window.history.replaceState({}, '', clean)
          router.replace('/dashboard')
        })
      }
    }

    // 2) As a backup, if we ever get a SIGNED_IN event, go to dashboard
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') router.replace('/dashboard')
    })
    return () => subscription.unsubscribe()
  }, [router, pathname])

  return null
}
