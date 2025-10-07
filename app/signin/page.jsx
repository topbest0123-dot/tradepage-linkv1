'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SignIn(){
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const send = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    error ? setError(error.message) : setSent(true)
  }

  return (
    <section>
      <h2>Sign in</h2>
      {sent ? <p>Check your email for the magic link.</p> : (
        <>
          <input
            placeholder="you@example.com"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            style={{padding:10, borderRadius:10, border:'1px solid #27406e', background:'#0b1428', color:'#eaf2ff', width:'100%', maxWidth:380}}
          />
          <div style={{height:8}} />
          <button onClick={send} style={{padding:'10px 14px', borderRadius:10, border:'1px solid #27406e',
            background:'linear-gradient(135deg,#66e0b9,#8ab4ff)', color:'#08101e', fontWeight:700}}>
            Send Magic Link
          </button>
          {error && <p style={{color:'#ff9b9b'}}>{error}</p>}
        </>
      )}
    </section>
  )
}
