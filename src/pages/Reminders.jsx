import { useEffect, useState } from 'react'
import { Bell, Plus, Trash2, CheckCircle2, Circle, Clock, BellOff, Pencil } from 'lucide-react'
import client from '../api/client'

function ReminderModal({ reminder, onClose, onSave }) {
  const isEdit = !!reminder?.id
  const [form, setForm] = useState({
    title:    reminder?.title    || '',
    deadline: reminder?.deadline ? reminder.deadline.slice(0, 10) : new Date().toISOString().slice(0, 10),
    time:     reminder?.notes?.match(/\[TIME:([\d:]+)\]/)?.[1] || '',
    priority: reminder?.priority || 'medium',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const notes = form.time ? `[TIME:${form.time}]` : null
      const payload = { title: form.title, deadline: form.deadline, priority: form.priority, notes }
      if (isEdit) await client.put(`/tasks/${reminder.id}`, payload)
      else        await client.post('/tasks', payload)
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save reminder')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit Reminder' : 'New Reminder'}</h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-sm text-danger bg-danger-subtle px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="label">Reminder *</label>
            <input className="input" placeholder="e.g. Depart for acupuncturist" value={form.title} onChange={set('title')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input className="input" type="date" value={form.deadline} onChange={set('deadline')} required />
            </div>
            <div>
              <label className="label">Time</label>
              <input className="input" type="time" value={form.time} onChange={set('time')} />
            </div>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={set('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReminderCard({ reminder, onToggle, onEdit, onDelete }) {
  const time      = reminder.notes?.match(/\[TIME:([\d:]+)\]/)?.[1]
  const deadline  = reminder.deadline
  const today     = new Date().toISOString().slice(0, 10)
  const isToday   = deadline === today
  const isOverdue = deadline && deadline < today && reminder.status !== 'completed'

  const dateLabel = isToday ? 'Today' : isOverdue ? 'Overdue'
    : deadline ? new Date(deadline + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''

  return (
    <div className={`card p-4 flex items-center gap-3 ${reminder.status === 'completed' ? 'opacity-50' : ''}`}>
      <button onClick={() => onToggle(reminder)} className={`shrink-0 transition-colors ${
        reminder.status === 'completed' ? 'text-fg' : 'text-fg-dim hover:text-fg'
      }`}>
        {reminder.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${reminder.status === 'completed' ? 'line-through text-fg-dim' : 'text-fg'}`}>{reminder.title}</p>
        {(deadline || time) && (
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={12} className={isOverdue ? 'text-danger' : 'text-fg-dim'} />
            <span className={`text-xs ${
              isOverdue ? 'text-danger font-medium'
              : isToday  ? 'text-fg font-semibold'
              : 'text-fg-dim'
            }`}>
              {dateLabel}{time ? ` · ${time}` : ''}
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        {reminder.status !== 'completed' && (
          <button onClick={() => onEdit(reminder)} className="p-1.5 rounded-lg hover:bg-surface-raised text-fg-dim transition-colors">
            <Pencil size={15} />
          </button>
        )}
        <button onClick={() => onDelete(reminder.id)} className="p-1.5 rounded-lg hover:bg-danger-subtle text-fg-dim hover:text-danger transition-colors">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)
  const [filter, setFilter]       = useState('upcoming')

  const load = async () => {
    try {
      const { data } = await client.get('/tasks')
      setReminders(data.tasks || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const toggle = async (r) => {
    const newStatus = r.status === 'completed' ? 'pending' : 'completed'
    await client.put(`/tasks/${r.id}`, { ...r, status: newStatus })
    load()
  }

  const del = async (id) => {
    if (!confirm('Delete this reminder?')) return
    await client.delete(`/tasks/${id}`)
    load()
  }

  const today = new Date().toISOString().slice(0, 10)

  const filtered = reminders.filter((r) => {
    if (filter === 'upcoming') return r.status !== 'completed' && (!r.deadline || r.deadline >= today)
    if (filter === 'today')    return r.deadline === today && r.status !== 'completed'
    if (filter === 'overdue')  return r.deadline && r.deadline < today && r.status !== 'completed'
    if (filter === 'done')     return r.status === 'completed'
    return true
  }).sort((a, b) => {
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return a.deadline.localeCompare(b.deadline)
  })

  const todayCount   = reminders.filter((r) => r.deadline === today && r.status !== 'completed').length
  const overdueCount = reminders.filter((r) => r.deadline && r.deadline < today && r.status !== 'completed').length

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reminders</h1>
          <p className="text-sm text-fg-muted">
            {todayCount > 0 && <span className="text-fg font-semibold">{todayCount} today</span>}
            {todayCount > 0 && overdueCount > 0 && ' · '}
            {overdueCount > 0 && <span className="text-danger font-medium">{overdueCount} overdue</span>}
            {todayCount === 0 && overdueCount === 0 && 'All clear'}
          </p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'today',    label: `Today${todayCount ? ` (${todayCount})` : ''}` },
          { key: 'overdue',  label: `Overdue${overdueCount ? ` (${overdueCount})` : ''}` },
          { key: 'done',     label: 'Done' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              filter === key
                ? 'bg-brand-strong text-brand-fg shadow-sm'
                : 'bg-surface text-fg-muted border border-line hover:bg-surface-raised'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-surface-raised rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-fg-dim">
          <BellOff size={40} className="mx-auto mb-3 opacity-30" />
          <p>No reminders here</p>
          <p className="text-sm mt-1">You can also set reminders via Chat</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => <ReminderCard key={r.id} reminder={r} onToggle={toggle} onEdit={(r) => setModal(r)} onDelete={del} />)}
        </div>
      )}

      {modal !== null && (
        <ReminderModal reminder={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />
      )}
    </div>
  )
}
