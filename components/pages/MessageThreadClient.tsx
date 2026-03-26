'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type Expert = {
  expert_id: number
  first_name: string
  last_name: string
  specialization?: string
  rating?: number
  is_verified?: boolean
}

type Message = {
  message_id: number
  sender: 'user' | 'expert'
  content: string
  created_at: string
}

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
    </div>
  )
}

function formatDay(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageThreadClient(props: {
  threadId: number
  expert: Expert
  initialMessages: Message[]
}) {
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<Message[]>(props.initialMessages)

  const expertName = `${props.expert.first_name} ${props.expert.last_name}`

  const grouped = useMemo(() => {
    const groups: Array<{ day: string; items: Message[] }> = []
    for (const m of messages) {
      const day = formatDay(m.created_at)
      const last = groups[groups.length - 1]
      if (!last || last.day !== day) groups.push({ day, items: [m] })
      else last.items.push(m)
    }
    return groups
  }, [messages])

  const onSend = () => {
    const value = text.trim()
    if (!value) return

    const next: Message = {
      message_id: (messages[messages.length - 1]?.message_id ?? 0) + 1,
      sender: 'user',
      content: value,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, next])
    setText('')

    // UI-only: simulate expert reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          message_id: next.message_id + 1,
          sender: 'expert',
          content: 'Thanks — I will review and get back to you shortly.',
          created_at: new Date().toISOString(),
        },
      ])
    }, 650)
  }

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile flex flex-col">
      <StatusBar />

      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Link
            href="/messages"
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>

          <div className="flex-1 text-center">
            <p className="text-base font-semibold text-brand-text-titles">{expertName}</p>
            <p className="text-xs text-brand-sub-text">
              {props.expert.specialization || 'Agricultural Expert'}
              {props.expert.is_verified ? ' • Verified' : ''}
            </p>
          </div>

          <div className="w-9"></div>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6 overflow-auto">
        {grouped.map((g) => (
          <div key={g.day} className="space-y-3">
            <div className="flex items-center justify-center">
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{g.day}</span>
            </div>

            {g.items.map((m) => {
              const isUser = m.sender === 'user'
              return (
                <div key={m.message_id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={
                      isUser
                        ? 'max-w-[78%] bg-brand-buttons text-white rounded-2xl rounded-br-md px-4 py-3'
                        : 'max-w-[78%] bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-3'
                    }
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    <p className={isUser ? 'text-[11px] text-white/80 mt-2 text-right' : 'text-[11px] text-gray-500 mt-2 text-right'}>
                      {formatTime(m.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-background">
        <div className="flex items-center gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-buttons focus:bg-white transition-all duration-200"
          />
          <button
            type="button"
            onClick={onSend}
            className="bg-brand-buttons text-white border-none px-4 py-3 rounded-xl font-semibold hover:opacity-90"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
