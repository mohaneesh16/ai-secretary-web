import { useEffect, useState } from 'react'
import { Mail, Send, RefreshCw, ChevronDown, ChevronUp, Inbox, Sparkles } from 'lucide-react'
import client from '../api/client'

function ComposeModal({ onClose, onSent, contacts }) {
  const [form, setForm]   = useState({ to: '', subject: '', body: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await client.post('/email/send', form)
      onSent()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send email')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Compose Email</h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-sm text-danger bg-danger-subtle px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="label">To *</label>
            <input className="input" type="email" placeholder="recipient@example.com" value={form.to} onChange={set('to')} required list="contact-emails" />
            <datalist id="contact-emails">{contacts.map((c) => c.email && <option key={c.id} value={c.email} label={c.name} />)}</datalist>
          </div>
          <div>
            <label className="label">Subject *</label>
            <input className="input" value={form.subject} onChange={set('subject')} required />
          </div>
          <div>
            <label className="label">Message *</label>
            <textarea className="input resize-none" rows={6} value={form.body} onChange={set('body')} required />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Send size={15} /> {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EmailCard({ email }) {
  const [expanded, setExpanded]       = useState(false)
  const [draft, setDraft]             = useState('')
  const [drafting, setDrafting]       = useState(false)
  const [sending, setSending]         = useState(false)
  const [sent, setSent]               = useState(false)
  const [replyError, setReplyError]   = useState('')

  const from    = email.from_name || email.from_email || email.from || ''
  const date    = email.received_at || email.date
  const isRead  = email.is_read ?? email.read ?? true
  const summary = email.ai_summary || email.body || email.snippet || ''
  const urgency = email.urgency

  const generateReply = async () => {
    setDrafting(true)
    setReplyError('')
    setDraft('')
    try {
      const { data } = await client.post('/email/draft-reply', { emailId: email.id })
      setDraft(data.draft || data.body || '')
    } catch (err) {
      setReplyError(err.response?.data?.error || 'Failed to generate reply')
    } finally { setDrafting(false) }
  }

  const sendReply = async () => {
    if (!draft.trim()) return
    setSending(true)
    setReplyError('')
    try {
      await client.post('/email/send', {
        to: email.from_email || email.from || '',
        subject: `Re: ${email.subject || ''}`,
        body: draft,
      })
      setSent(true)
      setDraft('')
    } catch (err) {
      setReplyError(err.response?.data?.error || 'Failed to send reply')
    } finally { setSending(false) }
  }

  return (
    <div className={`card p-4 ${urgency === 'urgent' ? 'border-l-2 border-l-fg' : ''}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${!isRead ? 'font-semibold' : 'font-medium'}`}>{email.subject || '(No subject)'}</p>
            <p className="text-xs text-fg-muted mt-0.5">{from}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {date && <span className="text-xs text-fg-dim">{new Date(date).toLocaleDateString('en-IN')}</span>}
            {urgency === 'urgent' && (
              <span className="text-xs font-medium text-fg-muted bg-surface-raised px-1.5 py-0.5 rounded">Urgent</span>
            )}
            {!isRead && <span className="w-2 h-2 rounded-full bg-fg" />}
            {expanded ? <ChevronUp size={15} className="text-fg-dim" /> : <ChevronDown size={15} className="text-fg-dim" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-line space-y-3">
          <p className="text-sm text-fg">
            {summary || <span className="italic text-fg-dim">No summary available</span>}
          </p>
          {sent ? (
            <p className="text-sm text-fg-muted">Reply sent.</p>
          ) : draft ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-fg-dim uppercase tracking-wide">Draft Reply</label>
              <textarea className="input resize-none text-sm" rows={5} value={draft} onChange={(e) => setDraft(e.target.value)} />
              {replyError && <p className="text-xs text-danger">{replyError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setDraft('')} className="btn-secondary text-sm py-1.5 flex-1">Discard</button>
                <button onClick={sendReply} disabled={sending} className="btn-primary text-sm py-1.5 flex-1 flex items-center justify-center gap-1.5">
                  <Send size={13} /> {sending ? 'Sending…' : 'Send Reply'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {replyError && <p className="text-xs text-danger mb-2">{replyError}</p>}
              <button onClick={generateReply} disabled={drafting} className="btn-secondary text-sm py-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-accent" /> {drafting ? 'Generating…' : 'AI Reply'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Email() {
  const [emails, setEmails]         = useState([])
  const [contacts, setContacts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [compose, setCompose]       = useState(false)
  const [needsConnect, setNeedsConnect] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [emailRes, contactRes] = await Promise.allSettled([
        client.get('/email/inbox?limit=50'),
        client.get('/contacts'),
      ])
      if (emailRes.status === 'fulfilled') {
        setEmails(emailRes.value.data?.emails || [])
        setNeedsConnect(false)
      } else if (emailRes.reason?.response?.status === 403) {
        setNeedsConnect(true)
      }
      if (contactRes.status === 'fulfilled') setContacts(contactRes.value.data?.contacts || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const token = localStorage.getItem('token')
  const connectUrl = `https://pers-ruxy.onrender.com/auth/google?token=${token}`

  if (needsConnect) return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Email</h1>
      <div className="card p-8 text-center">
        <Mail size={48} className="mx-auto mb-4 text-fg-dim opacity-70" />
        <h2 className="text-lg font-semibold mb-2">Connect Google Account</h2>
        <p className="text-sm text-fg-muted mb-6">Connect your Google account to access Gmail and send emails directly from Modev Secretary.</p>
        <a href={connectUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2">
          Connect Google Account
        </a>
        <button onClick={load} className="block mx-auto mt-3 text-sm text-fg-muted hover:underline">I already connected, refresh</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email</h1>
          <p className="text-sm text-fg-muted">{emails.length} messages</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary flex items-center gap-2"><RefreshCw size={15} /> Refresh</button>
          <button onClick={() => setCompose(true)} className="btn-primary flex items-center gap-2"><Send size={15} /> Compose</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-surface-raised rounded-xl animate-pulse" />)}</div>
      ) : emails.length === 0 ? (
        <div className="text-center py-16 text-fg-dim">
          <Inbox size={40} className="mx-auto mb-3 opacity-30" />
          <p>No emails in inbox</p>
        </div>
      ) : (
        <div className="space-y-2">
          {emails.map((e, i) => <EmailCard key={e.id || i} email={e} />)}
        </div>
      )}

      {compose && <ComposeModal contacts={contacts} onClose={() => setCompose(false)} onSent={() => { setCompose(false); load() }} />}
    </div>
  )
}
