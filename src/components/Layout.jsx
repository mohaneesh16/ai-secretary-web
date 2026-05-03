import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, Users, MessageSquare,
  Mail, Calendar, Settings, LogOut, Bot, Menu, Bell, Search, X
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

const NAV = [
  { to: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks',      label: 'Tasks',     icon: CheckSquare },
  { to: '/reminders',  label: 'Reminders', icon: Bell },
  { to: '/contacts',   label: 'Contacts',  icon: Users },
  { to: '/chat',       label: 'Chat',      icon: MessageSquare },
  { to: '/email',      label: 'Email',     icon: Mail },
  { to: '/calendar',   label: 'Calendar',  icon: Calendar },
  { to: '/settings',   label: 'Settings',  icon: Settings },
]

function GlobalSearch() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e) => { if (e.key === 'Escape') { setQuery(''); setResults(null) } }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults(null); return }
    const id = setTimeout(async () => {
      setLoading(true)
      try {
        const [contacts, tasks] = await Promise.allSettled([
          client.get('/contacts'),
          client.get('/tasks'),
        ])
        const q = query.toLowerCase()
        const matchedContacts = (contacts.value?.data?.contacts || [])
          .filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q))
          .slice(0, 4)
        const matchedTasks = (tasks.value?.data?.tasks || [])
          .filter(t => t.title?.toLowerCase().includes(q))
          .slice(0, 4)
        setResults({ contacts: matchedContacts, tasks: matchedTasks })
      } finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(id)
  }, [query])

  const go = (path) => { navigate(path); setQuery(''); setResults(null) }
  const total = (results?.contacts?.length || 0) + (results?.tasks?.length || 0)

  return (
    <div className="relative" ref={ref}>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${focused ? 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}`}>
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search tasks, contacts…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className="bg-transparent text-sm outline-none w-48 placeholder-gray-400"
        />
        {query && <button onClick={() => { setQuery(''); setResults(null) }}><X size={12} className="text-gray-400" /></button>}
      </div>

      {query && focused && (
        <div className="absolute top-full mt-1 left-0 w-72 card shadow-lg z-50 overflow-hidden">
          {loading && <p className="text-xs text-gray-400 px-3 py-2">Searching…</p>}
          {!loading && results && total === 0 && <p className="text-xs text-gray-400 px-3 py-3">No results for "{query}"</p>}
          {!loading && results?.tasks?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase px-3 pt-2 pb-1">Tasks</p>
              {results.tasks.map(t => (
                <button key={t.id} onClick={() => go('/tasks')} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm truncate">
                  {t.title}
                </button>
              ))}
            </div>
          )}
          {!loading && results?.contacts?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase px-3 pt-2 pb-1">Contacts</p>
              {results.contacts.map(c => (
                <button key={c.id} onClick={() => go('/contacts')} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm truncate">
                  {c.name} {c.email && <span className="text-gray-400 text-xs">· {c.email}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const NavItem = ({ to, label, icon: Icon }) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <Bot size={22} className="text-primary-600 shrink-0" />
        <span className="font-bold text-base">AI Secretary</span>
      </div>
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
        <GlobalSearch />
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((item) => <NavItem key={item.to} {...item} />)}
      </nav>
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button onClick={() => setOpen(true)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-primary-600" />
            <span className="font-bold">AI Secretary</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
