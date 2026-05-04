/**
 * devMode.ts
 * ─────────────────────────────────────────────────────────────
 * Development mode mock data and response generator.
 * Enable by setting NEXT_PUBLIC_DEV_MODE=true in .env.local
 *
 * When active, ALL backend API calls are intercepted and served
 * from this file — no real backend needed for UI development.
 *
 * HOW TO ADD A NEW ENDPOINT:
 * 1. Add mock data above if needed.
 * 2. Add a new `if` block in getMockResponse() matching your path + method.
 * 3. Return { status, data } for success or { status, error } for failure.
 */

// ─── Dev Mode Flag ────────────────────────────────────────────────────────────

export const isDev = () => process.env.NEXT_PUBLIC_DEV_MODE === 'true';

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Keep these at module level so state mutations during a session persist
// (e.g. login updates mockUser.email). In real production these don't run.

export const mockCredentials = {
  email: 'dev@example.com',
  password: 'password123',
};

export const mockUser = {
  user_id: 1,
  first_name: 'John',
  mid_name: 'Dev',
  last_name: 'Mode',
  email: mockCredentials.email,
  telephone: '+1234567890',
  password_hash: 'dev-mode',
  role: 'user',
  city: 'Accra',
  region: 'Greater Accra',
  country: 'Ghana',
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
};

export const mockDiseases = [
  {
    disease_id: 1,
    name: 'Black Pod Disease',
    description: 'A fungal disease caused by Phytophthora species that affects cocoa pods, turning them black.',
    urgency_level: 'high',
    image_url: '/img/blackpod.png',
    icon_name: 'shield-alert',
    treatments: [
      { name: 'Remove and destroy infected pods immediately' },
      { name: 'Apply copper-based fungicide to affected areas' },
      { name: 'Improve farm sanitation and drainage' },
    ],
  },
  {
    disease_id: 2,
    name: 'CSSVD',
    description: 'Cocoa Swollen Shoot Virus Disease — spread by mealybugs, causes swelling of shoots and roots.',
    urgency_level: 'high',
    image_url: '/img/ccsvd.png',
    icon_name: 'shield-alert',
    treatments: [
      { name: 'Remove and burn infected trees' },
      { name: 'Control mealybug vector populations' },
      { name: 'Replant with certified virus-free seedlings' },
    ],
  },
  {
    disease_id: 3,
    name: 'Vascular Streak Dieback',
    description: 'A fungal disease affecting vascular tissue, causing shoot dieback from the tips downward.',
    urgency_level: 'medium',
    image_url: '/img/vascularstreak.png',
    icon_name: 'leaf',
    treatments: [
      { name: 'Prune affected branches 30 cm below visible symptoms' },
      { name: 'Sterilise pruning tools between cuts' },
      { name: 'Improve shade and ventilation' },
    ],
  },
  {
    disease_id: 4,
    name: "Wasn't able to detect issue",
    description: 'No recognisable disease was detected in the image. The plant may be healthy or the image quality may be insufficient.',
    urgency_level: 'low',
    image_url: '/img/unknown.png',
    icon_name: 'help-circle',
    treatments: [
      { name: 'Try a clearer, closer photo in good lighting' },
      { name: 'Contact an expert for manual assessment' },
    ],
  },
];

export const mockScans = [
  {
    scan_id: 1,
    user_id: 1,
    image_url: '/img/scan-leaf.png',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    disease_id: 1,
    confidence_score: 0.92,
  },
  {
    scan_id: 2,
    user_id: 1,
    image_url: '/img/scan-leaf.png',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    disease_id: 4,
    confidence_score: 0.95,
  },
];

export const mockExperts = [
  {
    expert_id: 101,
    first_name: 'Ama',
    last_name: 'Mensah',
    email: 'ama.mensah@example.com',
    telephone: '+233200000001',
    specialization: 'Cocoa Diseases',
    organization: 'Boame Agronomy',
    bio: 'Field agronomist focused on cocoa pest & disease management.',
    years_experienced: 8,
    is_verified: true,
    rating: 4.8,
    location: 'Accra, Greater Accra',
    photo: null,
    created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    expert_id: 102,
    first_name: 'Kojo',
    last_name: 'Boateng',
    email: 'kojo.boateng@example.com',
    telephone: '+233200000002',
    specialization: 'Soil & Nutrition',
    organization: 'CocoaCare',
    bio: 'Helps farmers improve yield via nutrition and pruning plans.',
    years_experienced: 5,
    is_verified: true,
    rating: 4.6,
    location: 'Kumasi, Ashanti',
    photo: null,
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockConsultations = [
  {
    consultation_id: 1,
    user_id: 1,
    scan_id: 1,
    expert_id: 101,
    status: 'completed',
    recommendation: 'Apply fungicide treatment',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Message threads (conversations between user and expert)
export const mockThreads = [
  {
    thread_id: 1,
    expert_id: 101,
    user_id: mockUser.user_id,
    last_message: 'Send a clear photo of the pod and leaf.',
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread_count: 1,
  },
  {
    thread_id: 2,
    expert_id: 102,
    user_id: mockUser.user_id,
    last_message: 'How often do you apply compost?',
    updated_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    unread_count: 0,
  },
];

export const mockMessages = [
  {
    message_id: 1,
    thread_id: 1,
    sender: 'user' as const,
    content: 'Hi, I think my pod has black spots. What should I do?',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    message_id: 2,
    thread_id: 1,
    sender: 'expert' as const,
    content: 'Send a clear photo of the pod and leaf.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    message_id: 3,
    thread_id: 2,
    sender: 'expert' as const,
    content: 'How often do you apply compost?',
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockNotifications = [
  {
    notification_id: 1,
    title: 'Scan Ready',
    message: 'Your latest cocoa scan result is now available.',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    notification_id: 2,
    title: 'Farming Tip',
    message: 'Prune infected pods early to reduce disease spread.',
    is_read: true,
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Generate a minimal JWT-like token for dev mode.
 * NOT cryptographically signed — only used to satisfy code paths that decode
 * the JWT payload (e.g. to extract user_id). Never use in production.
 */
function makeDevJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.dev`;
}

/**
 * Strip query strings and trailing slashes from a path for consistent matching.
 * Example: '/history/1?limit=3' → '/history/1'
 */
function normalizePath(input: string): string {
  const [pathname] = input.split('?');
  const trimmed = (pathname ?? '').trim();
  return trimmed.length > 1 ? trimmed.replace(/\/+$/, '') : trimmed || '/';
}

// ─── Mock Response Type ───────────────────────────────────────────────────────

export interface MockResponse {
  status: number;
  data?: unknown;
  error?: string;
}

// ─── Mock Response Generator ──────────────────────────────────────────────────

/**
 * Match a path + method to a mock response.
 * Returns null if no mock exists for the given route (caller handles 404).
 *
 * ADDING A NEW MOCK:
 * Add a new if-block below following the same pattern.
 * Use regex for dynamic path segments: /^\/resource\/\d+$/.test(path)
 */
export function getMockResponse(
  path: string,
  method = 'GET',
  body?: unknown
): MockResponse | null {
  const p = normalizePath(path);
  const v = method.toUpperCase();

  // ── Auth ──────────────────────────────────────────────────────────────────

  if (p === '/auth/login' && v === 'POST') {
    const { email, password } = (body as Record<string, string>) ?? {};
    if (typeof email === 'string' && email && typeof password === 'string' && password) {
      // Accept any non-empty credentials in dev mode
      mockCredentials.email = email;
      mockCredentials.password = password;
      (mockUser as Record<string, unknown>).email = email;
      const token = makeDevJwt({ user_id: mockUser.user_id, email });
      return { status: 200, data: { token, user: mockUser } };
    }
    return { status: 401, error: 'Invalid email or password' };
  }

  if (p === '/auth/logout' && v === 'POST') {
    return { status: 200, data: { message: 'Logged out' } };
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  if (p === '/users/me' && v === 'GET') {
    return { status: 200, data: mockUser };
  }

  if (p === '/users/dashboard' && v === 'GET') {
    return {
      status: 200,
      data: {
        user_id: mockUser.user_id,
        user: mockUser,
        total_scans: mockScans.length,
        recent_scans: mockScans.slice(0, 3),
        pending_consultations: 1,
      },
    };
  }

  if (p === '/users' && v === 'POST') {
    // Signup — shallow-merge new fields into mockUser so login works after
    const b = (body ?? {}) as Record<string, unknown>;
    if (typeof b.first_name === 'string') (mockUser as Record<string, unknown>).first_name = b.first_name;
    if (typeof b.last_name  === 'string') (mockUser as Record<string, unknown>).last_name  = b.last_name;
    if (typeof b.email      === 'string') {
      (mockUser as Record<string, unknown>).email = b.email;
      mockCredentials.email = b.email;
    }
    if (typeof b.password === 'string') mockCredentials.password = b.password;
    return { status: 201, data: mockUser };
  }

  if (/^\/users\/\d+$/.test(p)) {
    const id = parseInt(p.split('/').pop() ?? '0');
    if (id !== mockUser.user_id) return { status: 404, error: 'User not found' };
    if (v === 'DELETE') return { status: 204, data: null };
    if (v === 'PUT') return { status: 200, data: { ...mockUser, ...(body ?? {}) } };
    return { status: 200, data: mockUser };
  }

  // ── Diseases ──────────────────────────────────────────────────────────────

  if (p === '/diseases' && v === 'GET') {
    return { status: 200, data: mockDiseases };
  }

  if (/^\/diseases\/\d+$/.test(p) && v === 'GET') {
    const id = parseInt(p.split('/').pop() ?? '0');
    const disease = mockDiseases.find((d) => d.disease_id === id);
    return disease ? { status: 200, data: disease } : { status: 404, error: 'Disease not found' };
  }

  // ── Scans ─────────────────────────────────────────────────────────────────

  if (p === '/scans' && v === 'GET') {
    return { status: 200, data: mockScans };
  }

  if (/^\/scans\/\d+$/.test(p) && v === 'GET') {
    const id = parseInt(p.split('/').pop() ?? '0');
    const scan = mockScans.find((s) => s.scan_id === id);
    return scan ? { status: 200, data: scan } : { status: 404, error: 'Scan not found' };
  }

  if (p === '/scans' && v === 'POST') {
    const next = {
      scan_id: mockScans.length + 1,
      user_id: mockUser.user_id,
      image_url: '/img/scan-leaf.png',
      created_at: new Date().toISOString(),
      disease_id: null,
      confidence_score: null,
    };
    mockScans.push(next as unknown as typeof mockScans[0]);
    return { status: 201, data: next };
  }

  // ── AI Prediction ─────────────────────────────────────────────────────────

  if (p.startsWith('/ai/predict') && v === 'POST') {
    return {
      status: 200,
      data: {
        scan_id: 1,
        disease_id: 1,
        predicted_disease: 'Black Pod Disease',
        confidence_score: 0.87,
        image_url: '/img/blackpod_r.png',
        recommendations: ['Apply fungicide', 'Monitor regularly'],
      },
    };
  }

  if (p === '/ai/voice-diagnose' && v === 'POST') {
    return {
      status: 200,
      data: {
        transcript: 'The pod appears to have dark spots',
        disease_id: 1,
        confidence_score: 0.75,
      },
    };
  }

  // ── History ───────────────────────────────────────────────────────────────

  if (/^\/history\/\d+$/.test(p) && v === 'GET') {
    const userId = parseInt(p.split('/').pop() ?? '0');
    if (userId !== mockUser.user_id) return { status: 404, error: 'User not found' };

    const scans = mockScans.map((scan) => {
      const disease = mockDiseases.find((d) => d.disease_id === scan.disease_id);
      const urgency_level = disease?.urgency_level ?? 'low';
      return {
        scan_id: scan.scan_id,
        disease_name: disease?.name ?? 'Unknown',
        urgency_level,
        image_preview_url: scan.image_url,
        created_at: scan.created_at,
        status_color:
          urgency_level === 'high'   ? '#DC2626' :
          urgency_level === 'medium' ? '#F59E0B' : '#16A34A',
      };
    });

    return { status: 200, data: { total_scans: mockScans.length, scans } };
  }

  // Save scan to history (POST /history/add)
  if (p === '/history/add' && v === 'POST') {
    return { status: 201, data: { ok: true } };
  }

  // Save scan to history (POST /history/:userId/:scanId)
  if (/^\/history\/\d+\/\d+$/.test(p) && v === 'POST') {
    return { status: 201, data: { ok: true } };
  }

  // ── Experts ───────────────────────────────────────────────────────────────

  if (p === '/experts' && v === 'GET') {
    return { status: 200, data: mockExperts };
  }

  if (/^\/experts\/\d+$/.test(p) && v === 'GET') {
    const id = parseInt(p.split('/').pop() ?? '0');
    const expert = mockExperts.find((e) => e.expert_id === id);
    return expert ? { status: 200, data: expert } : { status: 404, error: 'Expert not found' };
  }

  // ── Consultations ─────────────────────────────────────────────────────────

  if (p === '/consultations' && v === 'GET') {
    return { status: 200, data: mockConsultations };
  }

  if (p === '/consultations' && v === 'POST') {
    const now = new Date().toISOString();
    const next = {
      consultation_id: mockConsultations.length + 1,
      user_id: mockUser.user_id,
      status: 'pending',
      created_at: now,
      ...(body ?? {}),
    };

    mockConsultations.push(next as typeof mockConsultations[0]);

    // In real backend, a consultation usually becomes a messaging thread.
    // In dev mode, create a thread + seed the first message from the request.
    const b = (body ?? {}) as Record<string, unknown>;
    const expertId = typeof b.expert_id === 'number' ? b.expert_id : (mockExperts[0]?.expert_id ?? 101);
    const threadId = (next as Record<string, unknown>).consultation_id as number;
    const initialText = String(b.description ?? b.subject ?? 'New consultation').trim();

    const existingThread = mockThreads.find((t) => t.thread_id === threadId);
    if (!existingThread) {
      mockThreads.push({
        thread_id: threadId,
        expert_id: expertId,
        user_id: mockUser.user_id,
        last_message: initialText,
        updated_at: now,
        unread_count: 0,
      });
    }

    const lastMessageId = mockMessages.length > 0 ? (mockMessages[mockMessages.length - 1]?.message_id ?? 0) : 0;
    const nextMessageId = lastMessageId + 1;
    mockMessages.push({
      message_id: nextMessageId,
      thread_id: threadId,
      sender: 'user' as const,
      content: initialText,
      created_at: now,
    });

    // Update thread metadata
    const thread = mockThreads.find((t) => t.thread_id === threadId);
    if (thread) {
      thread.last_message = initialText;
      thread.updated_at = now;
    }

    return { status: 201, data: next };
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  // List all conversation threads for the current user
  if (p === '/messages/messages/conversations' && v === 'GET') {
    return { status: 200, data: mockThreads };
  }

  // Create a message (POST /messages/messages/)
  if (p === '/messages/messages/' && v === 'POST') {
    const b = (body ?? {}) as Record<string, unknown>;
    const consultationId = parseInt(String(b.consultation_id ?? b.thread_id ?? '0'));
    const content = String(b.content ?? '').trim();
    const senderId = parseInt(String(b.sender_id ?? mockUser.user_id));
    const messageType = String(b.message_type ?? 'text');
    const now = new Date().toISOString();

    if (!Number.isFinite(consultationId) || consultationId <= 0) {
      return { status: 400, error: 'Missing consultation_id' };
    }
    if (!content) {
      return { status: 400, error: 'Message content cannot be empty' };
    }

    const sender = senderId === mockUser.user_id ? ('user' as const) : ('expert' as const);
    const lastMessageId = mockMessages.length > 0 ? (mockMessages[mockMessages.length - 1]?.message_id ?? 0) : 0;
    const nextMessageId = lastMessageId + 1;

    mockMessages.push({
      message_id: nextMessageId,
      thread_id: consultationId,
      sender,
      content,
      created_at: now,
    });

    // Update / create the thread
    let thread = mockThreads.find((t) => t.thread_id === consultationId);
    if (!thread) {
      const expertId = mockExperts[0]?.expert_id ?? 101;
      thread = {
        thread_id: consultationId,
        expert_id: expertId,
        user_id: mockUser.user_id,
        last_message: content,
        updated_at: now,
        unread_count: 0,
      };
      mockThreads.push(thread);
    }

    thread.last_message = content;
    thread.updated_at = now;
    // Approximate unread behaviour for the farmer's inbox.
    if (sender === 'expert') thread.unread_count = (thread.unread_count ?? 0) + 1;

    return {
      status: 201,
      data: {
        message_id: nextMessageId,
        consultation_id: consultationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        is_read: false,
        created_at: now,
      },
    };
  }

  // Get messages in a specific thread
  if (/^\/messages\/\d+$/.test(p) && v === 'GET') {
    const id = parseInt(p.split('/').pop() ?? '0');
    const thread = mockThreads.find((t) => t.thread_id === id);
    if (!thread) return { status: 404, error: 'Thread not found' };
    const messages = mockMessages
      .filter((m) => m.thread_id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return { status: 200, data: { thread, messages } };
  }

  // Messages for a consultation (GET /messages/messages/consultation/{id})
  if (/^\/messages\/messages\/consultation\/\d+$/.test(p) && v === 'GET') {
    const id = parseInt(p.split('/').pop() ?? '0');
    const messages = mockMessages
      .filter((m) => m.thread_id === id)
      .map((m) => ({
        message_id: m.message_id,
        consultation_id: id,
        content: m.content,
        sender_id: m.sender === 'user'
          ? mockUser.user_id
          : (mockThreads.find((t) => t.thread_id === id)?.expert_id ?? 0),
        message_type: 'text',
        is_read: false,
        created_at: m.created_at,
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return { status: 200, data: messages };
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  if (p === '/notification/' && v === 'GET') {
    return { status: 200, data: mockNotifications };
  }

  // No mock matched — return null so caller can return 404
  return null;
}
