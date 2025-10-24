'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function SignInTest() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function sendLink(e) {
    e.preventDefault()
    setMsg('')
    if (!email.trim()) return
    try {
      setBusy(true)
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) throw error
      setMsg('Magic link sent. Check your inbox.')
    } catch (err) {
      setMsg(err.message || 'Failed to send link.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '48px auto', padding: 16 }}>
      <h1>Sign in (test)</h1>
      <form onSubmit={sendLink}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          style={{ width: '100%', padding: 12, marginBottom: 12 }}
        />
        <button type="submit" disabled={busy} style={{ padding: 12 }}>
          {busy ? 'Sending…' : 'Send magic link'}
        </button>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  )
}
