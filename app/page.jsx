'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Home(){
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash || ''
    if (hash.includes('access_token=')) {
      const p = new URLSearchParams(hash.slice(1))
      const access_token = p.get('access_token')
      const refresh_token = p.get('refresh_token')
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => {
          window.history.replaceState({}, '', window.location.pathname)
          router.replace('/dashboard')
        }).catch(console.error)
      }
    }
  }, [router])

  return (
    <section>
      <h1>Welcome to TradePage</h1>
      <p>Create a simple public page with your name, trade, city, services, prices and tap-to-call/WhatsApp.</p>
      <ol>
        <li><a href="/signin">Sign in</a> with your email (magic link)</li>
        <li>Go to <a href="/dashboard">Dashboard</a></li>
      </ol>
    </section>
  );
}
