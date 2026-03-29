'use client'

import Link from 'next/link'

type Thread = {
  thread_id: number
  expert_id: number
  user_id: number
  last_message: string
  updated_at: string
  unread_count: number
}

type Expert = {
  expert_id: number
  first_name: string
  last_name: string
  specialization?: string
  is_verified?: boolean
  rating?: number
}

 

function initials(first: string, last: string) {
  return `${(first || 'E')[0] ?? 'E'}${(last || 'X')[0] ?? 'X'}`.toUpperCase()
}

function formatTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessagesListClient(props: {
  threads: Thread[]
  expertsById: Record<number, Expert>
}) {
  const threads = props.threads

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
       

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between py-4 mb-4">
          <Link
            href="/home"
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Messages</h1>
          <div className="w-9"></div>
        </div>

        <div className="space-y-3">
          {threads.map((t) => {
            const expert = props.expertsById[t.expert_id]
            const expertName = expert ? `${expert.first_name} ${expert.last_name}` : 'Expert'
            const badge = t.unread_count > 0 ? String(t.unread_count) : null

            return (
              <Link
                key={t.thread_id}
                href={`/messages/${t.thread_id}`}
                className="block bg-gray-50 rounded-brand p-4 border border-gray-100 hover:bg-gray-100/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-900">
                    {expert ? initials(expert.first_name, expert.last_name) : 'EX'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{expertName}</p>
                        <p className="text-xs text-brand-sub-text truncate">
                          {expert?.specialization || 'Agricultural Expert'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-500">{formatTime(t.updated_at)}</span>
                        {badge ? (
                          <span className="min-w-5 h-5 px-1 rounded-full bg-brand-buttons text-white text-xs flex items-center justify-center">
                            {badge}
                          </span>
                        ) : (
                          <span className="w-5 h-5"></span>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-700 truncate">{t.last_message}</p>
                  </div>
                </div>
              </Link>
            )
          })}

          {threads.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-sm font-semibold text-gray-700">MSG</span>
              </div>
              <h2 className="text-lg font-semibold text-brand-text-titles mb-2">No messages yet</h2>
              <p className="text-brand-sub-text">Start a conversation with an expert.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
