import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import client from '../../api/client'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ otp: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      await client.post('/auth/reset-password', { otp: form.otp, newPassword: form.password })
      navigate('/login', { state: { message: 'Password reset! Please sign in.' } })
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f2f2f7] dark:bg-[#0a0a0a]">
      <div className="card w-full max-w-sm p-8">
        <Link to="/forgot-password" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter the 6-digit code from your email</p>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="label">Reset Code</label>
            <input className="input tracking-widest text-center text-lg" type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={form.otp} onChange={set('otp')} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
