import { useEffect, useRef, useState } from 'react'
import { Send, Bot, User, Trash2 } from 'lucide-react'
import client from '../api/client'

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-gray-900 dark:bg-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
        {isUser ? <User size={16} className="text-white dark:text-gray-900" /> : <Bot size={16} className="text-gray-600 dark:text-gray-300" />}
      </div>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/40 rounded-tl-sm'}`}>
        {msg.content}
      </div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [histLoading, setHistLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    client.get('/chat/history')
      .then(({ data }) => setMessages((data.history || []).slice(-50)))
      .catch(() => {})
      .finally(() => setHistLoading(false))
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const allMsgs = [...messages, userMsg]
      const { data } = await client.post('/chat/message', {
        messages: allMsgs.map(m => ({ role: m.role, content: m.content }))
      })
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch (err) {
      const msg = err.response?.data?.error || 'Sorry, something went wrong. Please try again.'
      setMessages((m) => [...m, { role: 'assistant', content: msg }])
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = async () => {
    if (!confirm('Clear all chat history?')) return
    await client.delete('/chat/history').catch(() => {})
    setMessages([])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-3rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered assistant</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory} className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={15} /> Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto card p-4 space-y-4 mb-4">
        {histLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading history…</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
            <Bot size={36} className="opacity-30" />
            <p>Start a conversation with your AI Secretary</p>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} msg={m} />)
        )}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Bot size={16} className="text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex items-center gap-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm">
              {[0,1,2].map((i) => (
                <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Ask your secretary anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()} className="btn-primary px-4">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
