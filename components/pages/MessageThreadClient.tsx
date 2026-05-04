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
import { mergeMessageLists, normalizeThreadMessages, type ChatMessage, type ChatRole } from '@/lib/messages';

// ─── Types ────────────────────────────────────────────────────────────────────

type LocalMessage = ChatMessage & { pending?: boolean };

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessageThreadClient({
  threadId,
  initialMessages,
  viewerRole,
  viewerId,
}: {
  threadId: string;
  initialMessages: ChatMessage[];
  viewerRole: ChatRole;
  viewerId?: number;
}) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stickToBottom, setStickToBottom] = useState(true);

  // Seed messages from server-fetched prop — no useEffect GET needed
  const [messages,  setMessages]  = useState<LocalMessage[]>(initialMessages as LocalMessage[]);
  const [input,     setInput]     = useState('');
  const [sending,   setSending]   = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const isMine = (msg: ChatMessage): boolean => {
    if (typeof viewerId === 'number' && typeof msg.sender_id === 'number') return msg.sender_id === viewerId;
    if (msg.sender) return msg.sender === viewerRole;
    return false;
  };

  const reconcileWithServer = (prev: LocalMessage[], server: ChatMessage[]): LocalMessage[] => {
    const pending = prev.filter((m) => m.pending === true);
    const serverList = server as LocalMessage[];

    // Drop pending messages that are now confirmed by the server.
    const keepPending = pending.filter((p) => {
      const tp = Date.parse(p.created_at);
      return !server.some((s) => {
        if (!isMine(s)) return false;
        if ((s.content ?? '').trim() !== (p.content ?? '').trim()) return false;
        const ts = Date.parse(s.created_at);
        // If timestamps are invalid, don't treat as confirmed.
        if (!Number.isFinite(tp) || !Number.isFinite(ts)) return false;
        return Math.abs(ts - tp) < 60_000;
      });
    });

    return mergeMessageLists(serverList, keepPending) as LocalMessage[];
  };

  const refreshMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${threadId}?as=${viewerRole}`, { cache: 'no-store' });
      if (!res.ok) return;
      const payload = await res.json().catch(() => null);
      const list = normalizeThreadMessages(payload);
      if (list.length === 0) return;
      setMessages((prev) => reconcileWithServer(prev, list));
    } catch {
      // ignore refresh errors (offline, etc.)
    }
  };

  // Poll for new messages (simple + reliable; websockets can be added later)
  useEffect(() => {
    void refreshMessages();
    const id = window.setInterval(() => { void refreshMessages(); }, 4000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // Scroll to bottom on initial load and when messages change (only if user is already near bottom)
  useEffect(() => {
    if (!stickToBottom) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stickToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSendError(null);
    setSending(true);

    // Optimistic update — show the message immediately in the UI
    const optimistic: LocalMessage = {
      message_id: Date.now(),
      sender: viewerRole,
      sender_id: viewerId,
      content: text,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultation_id: Number(threadId),
          content: text,
          message_type: 'text',
          sender_role: viewerRole,
        }),
      });

      if (!res.ok) {
        // Revert optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.message_id !== optimistic.message_id));
        setInput(text);
        const payload = await res.json().catch(() => null);
        setSendError(extractErrorMessage(payload, 'Failed to send message.'));
        return;
      }

      // Sync from server after a successful send (removes pending placeholder)
      await refreshMessages();
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
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        onScroll={() => {
          const el = scrollRef.current;
          if (!el) return;
          const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
          setStickToBottom(distance < 140);
        }}
      >

        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-10">No messages yet. Say hello!</p>
        )}

        {messages.map((msg) => {
          const mine = isMine(msg);
          return (
            <div key={msg.message_id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={
                  'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ' +
                  (mine
                    ? 'bg-brand-buttons text-white rounded-tr-none'
                    : 'bg-white text-gray-900 shadow-card rounded-tl-none')
                }
              >
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-gray-400'}`}>
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
