import { useEffect, useState } from 'react'
import { CheckSquare, Users, Mail, Calendar, Bot } from 'lucide-react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [briefing, setBriefing] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [stats, setStats]       = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const [brief, tasks, contacts] = await Promise.allSettled([
          client.get('/briefing/today'),
          client.get('/tasks'),
          client.get('/contacts'),
        ])
        if (brief.status === 'fulfilled')    setBriefing(brief.value.data)
        if (tasks.status === 'fulfilled')    setStats((s) => ({ ...s, tasks: (tasks.value.data?.tasks || []).filter(t => t.status !== 'completed').length }))
        if (contacts.status === 'fulfilled') setStats((s) => ({ ...s, contacts: (contacts.value.data?.all || contacts.value.data?.contacts || []).length }))
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
        <h1 className="text-2xl font-bold">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here's your daily overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Pending Tasks" value={stats.tasks} color="bg-gray-800 dark:bg-gray-700" />
        <StatCard icon={Users}       label="Contacts"      value={stats.contacts} color="bg-gray-700 dark:bg-gray-600" />
        <StatCard icon={Mail}        label="Email"         value="Gmail"      color="bg-gray-600 dark:bg-gray-500" />
        <StatCard icon={Calendar}    label="Calendar"      value="Google"     color="bg-gray-500 dark:bg-gray-400" />
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bot size={20} className="text-primary-600" />
          <h2 className="font-semibold">Morning Briefing</h2>
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
