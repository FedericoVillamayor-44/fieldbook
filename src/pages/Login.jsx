import { useState } from 'react'
import { supabase } from '../supabase'

const bg = "#0b1512", card = "#111c18", border = "#1e3329", green = "#10b981"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login')
  const [msg, setMsg] = useState('')

  const handleSubmit = async () => {
    if (!email || !password) return setMsg('Completá todos los campos')
    setLoading(true)
    setMsg('')
    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMsg(error.message)
      else setMsg('Revisá tu email para confirmar la cuenta')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg('Email o contraseña incorrectos')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380, background: card, border: `1px solid ${border}`, borderRadius: 20, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: green }}>FIELDBOOK</div>
          <div style={{ fontSize: 11, color: '#4ade80', letterSpacing: 2, opacity: 0.6 }}>EDUCACIÓN FÍSICA</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px', color: '#ecfdf5', fontSize: 14, outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px', color: '#ecfdf5', fontSize: 14, outline: 'none' }}
          />
          {msg && <div style={{ fontSize: 13, color: msg.includes('email') ? green : '#f87171', textAlign: 'center' }}>{msg}</div>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ background: green, border: 'none', borderRadius: 10, padding: '13px', color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: 15, marginTop: 4 }}
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMsg('') }}
            style={{ background: 'transparent', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: 13, marginTop: 4 }}
          >
            {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Entrá'}
          </button>
        </div>
      </div>
    </div>
  )
}