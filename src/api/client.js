import axios from 'axios'

// In production, always use /api — proxied through Vercel to Render (vercel.json)
// In development, use localhost:3000 via VITE_API_URL from .env
const BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3000')
  : '/api'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Only redirect to login if the token is truly gone/expired on a user-initiated page load.
// Never redirect from background syncs (import-google, profile, status checks, etc.)
const SILENT_URLS = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/profile',
  '/auth/google/status',
  '/contacts/import-google',
  '/briefing/today',
  '/calendar/events',
  '/email/',
]

let redirecting   = false
let retryingUrls  = new Set()

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !redirecting) {
      const url = err.config?.url || ''
      const isSilent = SILENT_URLS.some((u) => url.includes(u))
      if (!isSilent) {
        // Retry once after a brief pause — guards against Render cold-start
        // returning a transient 401 right after a successful login.
        if (!retryingUrls.has(url)) {
          retryingUrls.add(url)
          await new Promise((r) => setTimeout(r, 1500))
          retryingUrls.delete(url)
          try {
            return await client(err.config)
          } catch (retryErr) {
            if (retryErr.response?.status === 401 && !redirecting) {
              redirecting = true
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              window.location.href = '/login'
            }
            return Promise.reject(retryErr)
          }
        }
        redirecting = true
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default client
export { BASE_URL }
