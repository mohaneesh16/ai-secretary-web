import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor, LogOut, CheckCircle2, ExternalLink, ChevronRight, RefreshCw, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, changeTheme } = useTheme()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(user?.google_connected || false)
  const [checking, setChecking] = useState(false)

  const [profile, setProfile]             = useState({ name: user?.name || '', briefing_time: '06:55', language: 'english', mode: 'professional' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved]   = useState(false)
  const [profileError, setProfileError]   = useState('')

  const token = localStorage.getItem('token')
  const googleConnectUrl = `${import.meta.env.VITE_API_URL || 'https://pers-ruxy.onrender.com'}/auth/google?token=${token}`

  const checkGoogleStatus = async () => {
    setChecking(true)
    try {
      const { data } = await client.get('/auth/google/status')
      setGoogleConnected(data.connected)
    } catch {}
    finally { setChecking(false) }
  }

  useEffect(() => {
    checkGoogleStatus()
    const onFocus = () => checkGoogleStatus()
    window.addEventListener('focus', onFocus)
    client.get('/auth/profile').then(({ data }) => {
      const u = data.user
      setProfile({
        name:          u.name          || user?.name || '',
        briefing_time: u.briefing_time || '06:55',
        language:      u.language      || 'english',
        mode:          u.mode          || 'professional',
      })
    }).catch(() => {})
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const saveProfile = async () => {
    setSavingProfile(true)
    setProfileError('')
    setProfileSaved(false)
    try {
      await client.put('/auth/profile', profile)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to save')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      {/* Profile header */}
      <div className="card overflow-hidden">
        <div className="bg-canvas-subtle h-20" />
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-brand-strong border-4 border-canvas flex items-center justify-center text-3xl font-bold text-brand-fg shadow-md">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
          <p className="text-xl font-bold">{user?.name}</p>
          <p className="text-sm text-fg-muted mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim mb-4">Profile</p>
        <div className="space-y-3">
          <div>
            <label className="label">Display Name</label>
            <input className="input" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Briefing Time</label>
              <input className="input" type="time" value={profile.briefing_time} onChange={(e) => setProfile((p) => ({ ...p, briefing_time: e.target.value }))} />
            </div>
            <div>
              <label className="label">Language</label>
              <select className="input" value={profile.language} onChange={(e) => setProfile((p) => ({ ...p, language: e.target.value }))}>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">AI Mode</label>
            <select className="input" value={profile.mode} onChange={(e) => setProfile((p) => ({ ...p, mode: e.target.value }))}>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="concise">Concise</option>
            </select>
          </div>
          {profileError && <p className="text-sm text-danger">{profileError}</p>}
          <button onClick={saveProfile} disabled={savingProfile} className="btn-primary flex items-center gap-2">
            <Save size={15} /> {savingProfile ? 'Saving…' : profileSaved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim mb-4">Appearance</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'system', icon: Monitor, label: 'System' },
            { value: 'dark',   icon: Moon,    label: 'Dark'   },
            { value: 'light',  icon: Sun,     label: 'Light'  },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => changeTheme(value)}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                theme === value
                  ? 'border-line-focus bg-surface-raised text-fg'
                  : 'border-line text-fg-muted hover:border-line-strong'
              }`}
            >
              <Icon size={22} />
              <span className="text-sm font-medium">{label}</span>
              {theme === value && <CheckCircle2 size={14} className="text-accent" />}
            </button>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim">Integrations</p>
          <button onClick={checkGoogleStatus} disabled={checking} className="text-xs text-fg-muted hover:text-fg flex items-center gap-1 transition-colors">
            <RefreshCw size={12} className={checking ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        <div className="space-y-3">
          {googleConnected ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-positive-subtle border border-positive/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shadow-sm border border-line">
                  <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </div>
                <div>
                  <p className="font-medium text-sm text-positive">Google Account</p>
                  <p className="text-xs text-positive flex items-center gap-1">
                    <CheckCircle2 size={11} /> Connected
                  </p>
                </div>
              </div>
              <a href={googleConnectUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-positive hover:underline flex items-center gap-1">
                Reconnect <ExternalLink size={11} />
              </a>
            </div>
          ) : (
            <a href={googleConnectUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-line hover:border-line-strong transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-60"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </div>
                <div>
                  <p className="font-medium text-sm">Connect Google Account</p>
                  <p className="text-xs text-fg-muted">Gmail · Calendar · Contacts</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-fg-dim group-hover:text-fg transition-colors" />
            </a>
          )}
          <p className="text-xs text-fg-dim px-1">After connecting, refresh the page to update your status.</p>
        </div>
      </div>

      {/* About */}
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim mb-4">About</p>
        <div className="space-y-3">
          {[
            { label: 'App Version', value: '1.0.0' },
            { label: 'Platform',   value: 'Web'   },
            { label: 'AI Model',   value: 'GPT-4o' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1 border-b border-line last:border-0">
              <span className="text-sm text-fg-muted">{label}</span>
              <span className="text-sm font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button onClick={() => setShowLogout(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-danger text-danger hover:bg-danger-subtle font-medium transition-colors">
        <LogOut size={16} /> Sign Out
      </button>

      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-danger-subtle flex items-center justify-center mx-auto mb-4">
              <LogOut size={24} className="text-danger" />
            </div>
            <h2 className="text-lg font-bold mb-1">Sign Out</h2>
            <p className="text-sm text-fg-muted mb-6">Are you sure you want to sign out of Modev Secretary?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleLogout} className="flex-1 bg-danger hover:bg-danger/90 text-white font-medium px-4 py-2 rounded-lg transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
