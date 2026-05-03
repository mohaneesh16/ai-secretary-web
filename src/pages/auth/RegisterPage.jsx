import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bot, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
  const { signup, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')
    const res = await signup(form.name, form.email, form.password)
    if (res.ok) {
      setSuccess('Account created! Please sign in.')
      setTimeout(() => navigate('/login'), 1500)
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f2f2f7] dark:bg-[#0a0a0a]">
      <div className="card w-full max-w-sm p-8 shadow-modal">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gray-900 dark:bg-white flex items-center justify-center mb-5 shadow-sm">
            <Bot size={28} className="text-white dark:text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get started with AI Secretary</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error   && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-lg">{success}</p>}
          <div>
            <label className="label">Full Name</label>
            <input className="input" type="text" placeholder="John Doe" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
