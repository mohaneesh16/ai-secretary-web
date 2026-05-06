import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bot, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'

export default function LoginPage() {
  const { login, loading, loginHint } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [serverReady, setServerReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const warm = async () => {
      for (let i = 0; i < 20; i++) {
        try {
          await client.get('/')
          if (!cancelled) setServerReady(true)
          return
        } catch {
          if (cancelled) return
          await new Promise((r) => setTimeout(r, 4000))
        }
      }
      if (!cancelled) setServerReady(true)
    }
    warm()
    return () => { cancelled = true }
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(form.email, form.password)
    if (res.ok) navigate('/dashboard')
    else setError(res.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <div className="card w-full max-w-sm p-8 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-brand-strong flex items-center justify-center mb-5 shadow-sm">
            <Bot size={28} className="text-brand-fg" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">Modev Secretary</h1>
          <p className="text-sm text-fg-muted mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error && (
            <p className="text-sm text-danger bg-danger-subtle px-3 py-2.5 rounded-xl">{error}</p>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-dim hover:text-fg-muted transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-fg-muted hover:text-fg transition-colors">Forgot password?</Link>
          </div>
          {!serverReady && !loading && (
            <p className="text-xs text-center text-fg-dim animate-pulse">Connecting to server…</p>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          {loginHint && (
            <p className="text-xs text-center text-fg-dim animate-pulse">{loginHint}</p>
          )}
        </form>

        <p className="text-sm text-center text-fg-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-fg font-semibold hover:underline">Create one</Link>
        </p>
        <p className="text-xs text-center text-fg-muted mt-4">
          <Link to="/privacy" className="hover:text-fg transition-colors">Privacy Policy</Link>
          {' · '}
          <Link to="/terms" className="hover:text-fg transition-colors">Terms of Service</Link>
        </p>
      </div>
    </div>
  )
}
