/**
 * MessageThreadClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Chat view between user and an expert. Receives initial messages
 * as a prop from the server component — no GET fetch here.
 *
 * Server fetches (in app/messages/[thread_id]/page.tsx):
 *   GET /messages/:id → initialMessages prop
 *
 * Client mutations:
 *   POST /messages/:id — send a new message (optimistic update)
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import { extractErrorMessage, formatTime } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  message_id: number;
  sender: 'user' | 'expert';
  content: string;
  created_at: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessageThreadClient({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Seed messages from server-fetched prop — no useEffect GET needed
  const [messages,  setMessages]  = useState<Message[]>(initialMessages);
  const [input,     setInput]     = useState('');
  const [sending,   setSending]   = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Scroll to bottom on initial load and when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSendError(null);
    setSending(true);

    // Optimistic update — show the message immediately in the UI
    const optimistic: Message = {
      message_id: Date.now(),
      sender: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');

    try {
      const res = await fetch(`/api/messages/${threadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        // Revert optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.message_id !== optimistic.message_id));
        setInput(text);
        const payload = await res.json().catch(() => null);
        setSendError(extractErrorMessage(payload, 'Failed to send message.'));
      }
    } catch (err) {
      // Revert optimistic message on network error
      setMessages((prev) => prev.filter((m) => m.message_id !== optimistic.message_id));
      setInput(text);
      setSendError(extractErrorMessage(err, 'Connection failed. Please check your internet.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold text-brand-text-titles">Thread #{threadId}</h1>
        <div className="w-9" />
      </div>

      {/* ── Messages ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-10">No messages yet. Say hello!</p>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.message_id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={
                  'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ' +
                  (isUser
                    ? 'bg-brand-buttons text-white rounded-tr-none'
                    : 'bg-white text-gray-900 shadow-card rounded-tl-none')
                }
              >
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isUser ? 'text-white/70' : 'text-gray-400'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Bar ──────────────────────────────────────────────────────── */}
      <div className="px-4 pb-6 pt-2 border-t border-gray-100">
        {sendError && <p className="text-xs text-red-500 mb-2">{sendError}</p>}
        <div className="flex items-center gap-2">
          <input
            id="message-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20"
          />
          <button
            id="send-message-btn"
            type="button"
            onClick={() => void handleSend()}
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="w-11 h-11 rounded-full bg-brand-buttons flex items-center justify-center text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
