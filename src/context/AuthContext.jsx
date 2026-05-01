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

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await client.post('/auth/login', { email, password })
      saveSession(data.token, { name: data.user.name, email: data.user.email })
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.response?.data?.error || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    setLoading(true)
    try {
      await client.post('/auth/signup', { name, email, password })
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.response?.data?.error || 'Sign up failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Safe fallback so destructuring never throws if context is null
export const useAuth = () => useContext(AuthContext) ?? { user: null, token: null, loading: false, login: async () => ({}), signup: async () => ({}), logout: () => {} }
