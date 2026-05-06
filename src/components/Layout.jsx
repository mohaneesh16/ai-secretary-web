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

// Semantic design tokens — all colors via CSS variables
const S = {
  sidebar:     'bg-canvas-subtle border-r border-line',
  navActive:   'bg-brand-strong text-brand shadow-sm',
  navIdle:     'text-fg-muted hover:bg-surface hover:text-fg',
  logoBox:     'bg-brand-strong',
  logoIcon:    'text-brand',
  userBox:     'bg-surface border border-line',
  userAvatar:  'bg-brand-strong text-brand',
  userEmail:   'text-fg-dim',
  logoutBtn:   'text-fg-dim hover:bg-danger-subtle hover:text-danger',
  searchBox:   'border-line-strong bg-surface',
  searchFocus: 'border-line-focus bg-surface',
  searchInput: 'text-fg placeholder:text-fg-dim',
  topbar:      'bg-canvas-subtle border-b border-line',
}

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
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${focused ? S.searchFocus : S.searchBox}`}>
        <Search size={13} className="text-fg-dim shrink-0" />
        <input
          type="text"
          placeholder="Search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className={`bg-transparent text-xs outline-none w-full ${S.searchInput}`}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults(null) }} className="shrink-0">
            <X size={11} className="text-fg-dim" />
          </button>
        )}
      </div>

      {query && focused && (
        <div className="absolute top-full mt-2 left-0 right-0 card shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)] z-50 overflow-hidden py-1">
          {loading && <p className="text-xs text-fg-muted px-3 py-2.5">Searching…</p>}
          {!loading && results && total === 0 && (
            <p className="text-xs text-fg-muted px-3 py-3">No results for "{query}"</p>
          )}
          {!loading && results?.tasks?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-fg-dim uppercase tracking-widest px-3 pt-2.5 pb-1">Tasks</p>
              {results.tasks.map(t => (
                <button key={t.id} onClick={() => go('/tasks')}
                  className="w-full text-left px-3 py-2 hover:bg-surface-raised text-xs truncate transition-colors text-fg">
                  {t.title}
                </button>
              ))}
            </div>
          )}
          {!loading && results?.contacts?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-fg-dim uppercase tracking-widest px-3 pt-2.5 pb-1">Contacts</p>
              {results.contacts.map(c => (
                <button key={c.id} onClick={() => go('/contacts')}
                  className="w-full text-left px-3 py-2 hover:bg-surface-raised text-xs truncate transition-colors text-fg">
                  {c.name}{c.email && <span className="text-fg-muted"> · {c.email}</span>}
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
        `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive ? S.navActive + ' shadow-sm' : S.navIdle
        }`
      }
    >
      <Icon size={16} className="shrink-0" />
      <span className="tracking-tight">{label}</span>
    </NavLink>
  )

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className={`w-8 h-8 rounded-xl ${S.logoBox} flex items-center justify-center shadow-sm shrink-0`}>
          <Bot size={16} className={S.logoIcon} />
        </div>
        <span className="font-bold text-sm tracking-tight">Modev Secretary</span>
      </div>

      <div className="px-3 pb-3">
        <GlobalSearch />
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => <NavItem key={item.to} {...item} />)}
      </nav>

      <div className="p-3 mt-auto">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${S.userBox}`}>
          <div className={`w-7 h-7 rounded-full ${S.userAvatar} flex items-center justify-center text-xs font-bold shrink-0`}>
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-tight truncate">{user?.name}</p>
            <p className={`text-[10px] truncate ${S.userEmail}`}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} className={`p-1.5 rounded-lg transition-colors ${S.logoutBtn}`} title="Sign out">
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`hidden md:flex flex-col w-60 shrink-0 ${S.sidebar}`}>
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className={`relative z-50 flex flex-col w-64 ${S.sidebar}`}>
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className={`md:hidden flex items-center gap-3 px-4 py-3 ${S.topbar}`}>
          <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-surface-raised transition-colors">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg ${S.logoBox} flex items-center justify-center`}>
              <Bot size={13} className={S.logoIcon} />
            </div>
            <span className="font-bold text-sm tracking-tight">Modev Secretary</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="max-w-4xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
