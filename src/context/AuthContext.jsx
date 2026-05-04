import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

const safeParseUser = () => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

const safeGetToken = () => {
  const t = localStorage.getItem('token')
  if (!t || t === 'undefined' || t === 'null') {
    localStorage.removeItem('token')
    return null
  }
  return t
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(safeParseUser)
  const [token, setToken]     = useState(safeGetToken)
  const [loading, setLoading] = useState(false)
  const [loginHint, setLoginHint] = useState('')

  useEffect(() => {
    const storedToken = safeGetToken()
    if (!storedToken) return
    client.get('/auth/profile').then(({ data }) => {
      const u = { name: data.user.name, email: data.user.email, google_connected: data.user.google_connected }
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
    }).catch(() => {})
  }, [])

  const saveSession = (t, u) => {
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  // Retry on network errors AND 502/503/504 — Render free tier cold-starts return these
  const isRetryable = (e) => {
    if (!e.response) return true
    const s = e.response.status
    return s === 502 || s === 503 || s === 504
  }

  const postWithRetry = async (url, body, onRetry) => {
    for (let attempt = 0; attempt <= 12; attempt++) {
      try {
        return await client.post(url, body)
      } catch (e) {
        if (!isRetryable(e) || attempt === 12) throw e
        if (attempt === 0) onRetry?.()
        await sleep(attempt < 4 ? 4000 : 6000)
      }
    }
  }

  const apiError = (e, fallback) =>
    e.response?.data?.error || fallback

  const login = async (email, password) => {
    setLoading(true)
    setLoginHint('')
    try {
      const { data } = await postWithRetry('/auth/login', { email, password }, () =>
        setLoginHint('Server is waking up, please wait (~30 seconds)…')
      )
      saveSession(data.token, { name: data.user.name, email: data.user.email })
      return { ok: true }
    } catch (e) {
      const detail = e.code || e.message || (e.response ? `HTTP ${e.response.status}` : 'no response')
      return { ok: false, error: apiError(e, `Unable to reach server (${detail}). Please try again.`) }
    } finally {
      setLoading(false)
      setLoginHint('')
    }
  }

  const signup = async (name, email, password) => {
    setLoading(true)
    setLoginHint('')
    try {
      await postWithRetry('/auth/signup', { name, email, password }, () =>
        setLoginHint('Server is waking up, please wait (~30 seconds)…')
      )
      return { ok: true }
    } catch (e) {
      return { ok: false, error: apiError(e, 'Unable to reach server. Please try again.') }
    } finally {
      setLoading(false)
      setLoginHint('')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, loginHint, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Safe fallback so destructuring never throws if context is null
export const useAuth = () => useContext(AuthContext) ?? { user: null, token: null, loading: false, loginHint: '', login: async () => ({}), signup: async () => ({}), logout: () => {} }
