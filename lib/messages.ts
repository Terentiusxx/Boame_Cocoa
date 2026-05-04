import { unwrapData } from '@/lib/utils';

export type ChatRole = 'user' | 'expert';

export type ChatMessage = {
  message_id: number;
  content: string;
  created_at: string;
  sender_id?: number;
  sender?: ChatRole;
  message_type?: 'text' | 'image' | 'file';
  is_read?: boolean;
};

function asNumber(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : value == null ? undefined : String(value);
}

function isChatRole(value: unknown): value is ChatRole {
  return value === 'user' || value === 'expert';
}

function sortByTimeThenId(a: ChatMessage, b: ChatMessage): number {
  const ta = Date.parse(a.created_at);
  const tb = Date.parse(b.created_at);
  if (Number.isFinite(ta) && Number.isFinite(tb) && ta !== tb) return ta - tb;
  if (a.message_id !== b.message_id) return a.message_id - b.message_id;
  return 0;
}

/**
 * Normalizes backend payloads into a flat list of chat messages.
 * Handles common shapes:
 * - Message[]
 * - { messages: Message[] }
 * - { thread: ..., messages: Message[] }
 * - { data: ... } envelope around any of the above
 */
export function normalizeThreadMessages(payload: unknown): ChatMessage[] {
  const unwrapped = unwrapData<unknown>(payload as { data?: unknown } | null) ?? payload;

  let rawList: unknown[] = [];

  if (Array.isArray(unwrapped)) {
    rawList = unwrapped;
  } else if (unwrapped && typeof unwrapped === 'object') {
    const obj = unwrapped as Record<string, unknown>;
    if (Array.isArray(obj.messages)) rawList = obj.messages;
    else if (Array.isArray((obj.thread as Record<string, unknown> | undefined)?.messages)) {
      rawList = (obj.thread as Record<string, unknown>).messages as unknown[];
    }
  }

  const messages = rawList
    .map((item, i) => {
      if (!item || typeof item !== 'object') return null;
      const m = item as Record<string, unknown>;

      const message_id = asNumber(m.message_id ?? m.id) ?? i + 1;
      const content = asString(m.content ?? m.message ?? m.text) ?? '';
      const created_at = asString(m.created_at ?? m.createdAt) ?? new Date().toISOString();

      const sender_id = asNumber(m.sender_id ?? m.senderId);
      const sender = isChatRole(m.sender) ? m.sender : undefined;

      const message_type = (m.message_type === 'text' || m.message_type === 'image' || m.message_type === 'file')
        ? (m.message_type as ChatMessage['message_type'])
        : undefined;
      const is_read = typeof m.is_read === 'boolean' ? m.is_read : undefined;

      const out: ChatMessage = {
        message_id,
        content,
        created_at,
      };

      if (sender_id !== undefined) out.sender_id = sender_id;
      if (sender !== undefined) out.sender = sender;
      if (message_type !== undefined) out.message_type = message_type;
      if (is_read !== undefined) out.is_read = is_read;

      return out;
    })
    .filter((x): x is ChatMessage => x !== null)
    .sort(sortByTimeThenId);

  return messages;
}

/** Merge two message lists by message_id, returning a sorted unique array. */
export function mergeMessageLists(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const map = new Map<number, ChatMessage>();
  for (const m of existing) map.set(m.message_id, m);
  for (const m of incoming) {
    const prev = map.get(m.message_id);
    map.set(m.message_id, prev ? { ...prev, ...m } : m);
  }
  return Array.from(map.values()).sort(sortByTimeThenId);
}
