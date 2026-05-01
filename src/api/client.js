import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://pers-ruxy.onrender.com'

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
]

let redirecting = false
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !redirecting) {
      const url = err.config?.url || ''
      const isSilent = SILENT_URLS.some((u) => url.includes(u))
      if (!isSilent) {
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
