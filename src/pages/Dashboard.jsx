import { useEffect, useState } from 'react'
import { CheckSquare, Users, Mail, Calendar, Bot, Clock, AlertCircle } from 'lucide-react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 tracking-tight">{label}</p>
        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Icon size={15} className="text-gray-500 dark:text-gray-400" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value ?? '—'}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [briefing, setBriefing]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [stats, setStats]           = useState({})
  const [todayEvents, setTodayEvents] = useState([])
  const [overdueTasks, setOverdueTasks] = useState([])

  useEffect(() => {
    const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

    const load = async () => {
      try {
        const [brief, tasks, contacts, events] = await Promise.allSettled([
          client.get('/briefing/today'),
          client.get('/tasks'),
          client.get('/contacts'),
          client.get('/calendar/events'),
        ])
        if (brief.status === 'fulfilled')    setBriefing(brief.value.data)
        if (tasks.status === 'fulfilled') {
          const all = tasks.value.data?.tasks || []
          const pending = all.filter(t => t.status !== 'completed')
          setStats((s) => ({ ...s, tasks: pending.length }))
          setOverdueTasks(all.filter(t => t.deadline && t.deadline < todayIST && t.status !== 'completed').slice(0, 3))
        }
        if (contacts.status === 'fulfilled') setStats((s) => ({ ...s, contacts: (contacts.value.data?.all || contacts.value.data?.contacts || []).length }))
        if (events.status === 'fulfilled') {
          const all = events.value.data?.events || []
          const todays = all.filter(e => {
            if (!e.start_time) return false
            const d = new Date(e.start_time)
            const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
            return key === todayIST
          })
          setTodayEvents(todays.slice(0, 4))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{greeting}, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here's your daily overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Pending Tasks" value={stats.tasks} />
        <StatCard icon={Users}       label="Contacts"      value={stats.contacts} />
        <StatCard icon={Mail}        label="Email"         value="Gmail" />
        <StatCard icon={Calendar}    label="Today"         value={todayEvents.length || 'Free'} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's Events */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-gray-600 dark:text-gray-400" />
            <h2 className="font-semibold text-sm">Today's Schedule</h2>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
          ) : todayEvents.length === 0 ? (
            <p className="text-sm text-gray-400">No events today — enjoy the free day.</p>
          ) : (
            <div className="space-y-2">
              {todayEvents.map((e, i) => {
                const t = new Date(e.start_time)
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-xs text-gray-400 w-12 shrink-0 font-mono">
                      {t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                    <p className="text-sm truncate">{e.title}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} className="text-gray-600 dark:text-gray-400" />
            <h2 className="font-semibold text-sm">Overdue Tasks</h2>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
          ) : overdueTasks.length === 0 ? (
            <p className="text-sm text-gray-400">No overdue tasks. You're on track!</p>
          ) : (
            <div className="space-y-2">
              {overdueTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 w-12 shrink-0 font-mono">
                    {new Date(t.deadline + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  <p className="text-sm truncate">{t.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Morning Briefing */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bot size={20} className="text-gray-500 dark:text-gray-400" />
          <h2 className="font-semibold">Daily Briefing</h2>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : briefing?.briefing?.content ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{briefing.briefing.content}</p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No briefing available yet. Add some tasks and contacts to get started.</p>
        )}
      </div>
    </div>
  )
}
