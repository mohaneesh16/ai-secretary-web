import { useEffect, useState } from 'react'
import { Search, Trash2, Pencil, User } from 'lucide-react'
import client from '../api/client'

function ContactModal({ contact, onClose, onSave }) {
  const isEdit = !!contact?.id
  const [form, setForm] = useState({
    name:    contact?.name    || '',
    email:   contact?.email   || '',
    phone:   contact?.phone   || '',
    company: contact?.company || '',
    notes:   contact?.notes   || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) await client.put(`/contacts/${contact.id}`, form)
      else        await client.post('/contacts', form)
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save contact')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit Contact' : 'New Contact'}</h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="tel" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="col-span-2">
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={set('company')} />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} />
            </div>
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

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncMsg, setSyncMsg] = useState('')
  const [search, setSearch]   = useState('')
  const [modal, setModal]     = useState(null)

  const load = async () => {
    try {
      const { data } = await client.get('/contacts')
      setContacts(data.all || data.contacts || [])
    } finally {
      setLoading(false)
    }
  }

  const syncGoogle = async () => {
    try {
      const { data } = await client.get('/contacts/import-google')
      if (data.imported > 0) {
        setSyncMsg(`Synced ${data.imported} new contacts from Google`)
        load()
      }
    } catch {
      // not connected — silently skip
    }
  }

  useEffect(() => {
    load()
    syncGoogle()
  }, [])

  const del = async (id) => {
    if (!confirm('Delete this contact?')) return
    await client.delete(`/contacts/${id}`)
    load()
  }

  const filtered = contacts.filter((c) =>
    !search || `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Contacts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{contacts.length} total</p>
      </div>
      {syncMsg && (
        <p className="text-sm px-3 py-2 rounded-lg text-green-600 bg-green-50 dark:bg-green-950/30">{syncMsg}</p>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9" placeholder="Search contacts…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p>{search ? 'No contacts found' : 'No contacts yet'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm shrink-0">
                {c.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{[c.email, c.company].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setModal(c)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                  <Pencil size={15} />
                </button>
                <button onClick={() => del(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <ContactModal contact={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />
      )}
    </div>
  )
}
