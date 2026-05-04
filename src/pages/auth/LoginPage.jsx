import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bot, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login, loading, loginHint } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(form.email, form.password)
    if (res.ok) navigate('/dashboard')
    else setError(res.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f2f2f7] dark:bg-[#0a0a0a]">
      <div className="card w-full max-w-sm p-8 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gray-900 dark:bg-white flex items-center justify-center mb-5 shadow-sm">
            <Bot size={28} className="text-white dark:text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Secretary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50/80 dark:bg-red-950/20 px-3 py-2.5 rounded-xl">{error}</p>}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-gray-900 dark:text-white hover:underline">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          {loginHint && (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 animate-pulse">{loginHint}</p>
          )}
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-gray-900 dark:text-white font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
