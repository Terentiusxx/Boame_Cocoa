/**
 * Development mode utilities for UI design without backend
 * Enable by setting NEXT_PUBLIC_DEV_MODE=true in .env.local
 */

export const isDev = () => process.env.NEXT_PUBLIC_DEV_MODE === 'true'

// ────────────────────────────────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────────────────────────────────

export const mockDiseases = [
  {
    disease_id: 1,
    name: 'Black Pod Disease',
    description: 'Fungal disease affecting cocoa pods',
    urgency_level: 'high',
    image_url: '/img/blackpod.png',
    icon_name: '🍫',
    treatments: [{ name: 'Remove infected pods' }, { name: 'Apply fungicide' }],
  },
  {
    disease_id: 2,
    name: 'CSSVD',
    description: 'Cocoa Swollen Shoot Virus Disease',
    urgency_level: 'high',
    image_url: '/img/ccsvd.png',
    icon_name: '🦠',
    treatments: [{ name: 'Remove infected trees' }, { name: 'Control vectors' }],
  },
  {
    disease_id: 3,
    name: 'Vascular Streak Dieback',
    description: 'Disease affecting vascular tissue causing dieback',
    urgency_level: 'medium',
    image_url: '/img/vascularstreak.png',
    icon_name: '🌿',
    treatments: [{ name: 'Prune affected branches' }, { name: 'Improve sanitation' }],
  },
  {
    disease_id: 4,
    name: "Wasn't able to detect issue",
    description: 'No disease detected',
    urgency_level: 'low',
    image_url: '/img/unknown.png',
    icon_name: '❓',
    treatments: [{ name: 'Try a clearer photo' }],
  },
]

export const mockCredentials = {
  email: 'dev@example.com',
  password: 'password123',
}

export const mockUser = {
  user_id: 1,
  first_name: 'John',
  mid_name: 'Dev',
  last_name: 'Mode',
  email: mockCredentials.email,
  telephone: '+1234567890',
  password_hash: 'dev-mode',
  role: 'user',
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
}

export const mockScans = [
  {
    scan_id: 1,
    user_id: 1,
    image_url: '/img/scan-leaf.png',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    disease_id: 1,
    confidence_score: 0.92,
    notes: 'Black pod disease detected on lower portion',
  },
  {
    scan_id: 2,
    user_id: 1,
    image_url: '/img/scan-leaf.png',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    disease_id: 4,
    confidence_score: 0.95,
    notes: 'Healthy pod - no issues',
  },
]

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
]

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
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

type MockThread = {
  thread_id: number
  expert_id: number
  user_id: number
  last_message: string
  updated_at: string
  unread_count: number
}

type MockMessage = {
  message_id: number
  thread_id: number
  sender: 'user' | 'expert'
  content: string
  created_at: string
}

export const mockThreads: MockThread[] = [
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
]

export const mockMessages: MockMessage[] = [
  {
    message_id: 1,
    thread_id: 1,
    sender: 'user',
    content: 'Hi, I think my pod has black spots. What should I do?',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    message_id: 2,
    thread_id: 1,
    sender: 'expert',
    content: 'Send a clear photo of the pod and leaf.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    message_id: 3,
    thread_id: 2,
    sender: 'expert',
    content: 'How often do you apply compost?',
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
]

function makeDevJwt(payload: Record<string, unknown>) {
  // Not a real signature; only for local dev to satisfy code paths that decode JWT payload.
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.dev`
}

function normalizePath(inputPath: string) {
  const [pathname] = inputPath.split('?')
  const trimmed = (pathname || '').trim()
  const withoutTrailing = trimmed.length > 1 ? trimmed.replace(/\/+$/, '') : trimmed
  return withoutTrailing || '/'
}

// ────────────────────────────────────────────────────────────────────────────
// Mock Response Generator
// ────────────────────────────────────────────────────────────────────────────

export interface MockResponse {
  status: number;
  data?: any;
  error?: string;
}

export function getMockResponse(path: string, method: string = 'GET', body?: any): MockResponse | null {
  const normalizedPath = normalizePath(path)
  const verb = (method || 'GET').toUpperCase()

  // Auth endpoints
  if (normalizedPath === '/auth/login' && verb === 'POST') {
    const { email, password } = body || {};
    
    // Dev mode: accept credentials (and remember them if provided)
    if (typeof email === 'string' && typeof password === 'string' && email && password) {
      mockCredentials.email = email
      mockCredentials.password = password
      ;(mockUser as any).email = email
      const token = makeDevJwt({ user_id: mockUser.user_id, email: mockUser.email })
      return { 
        status: 200, 
        data: { 
          token,
          user: mockUser,
        } 
      };
    } else {
      return { 
        status: 401, 
        error: 'Invalid email or password' 
      };
    }
  }

  if (normalizedPath === '/auth/logout' && verb === 'POST') {
    return { status: 200, data: { message: 'Logged out' } };
  }

  // Users endpoints
  if (normalizedPath === '/users/me' && verb === 'GET') {
    return { status: 200, data: mockUser };
  }

  if (normalizedPath === '/users' && verb === 'POST') {
    if (body && typeof body === 'object') {
      const b: any = body
      if (typeof b.first_name === 'string') (mockUser as any).first_name = b.first_name
      if (typeof b.mid_name === 'string') (mockUser as any).mid_name = b.mid_name
      if (typeof b.last_name === 'string') (mockUser as any).last_name = b.last_name
      if (typeof b.email === 'string') {
        ;(mockUser as any).email = b.email
        mockCredentials.email = b.email
      }
      if (typeof b.telephone === 'string') (mockUser as any).telephone = b.telephone
      if (typeof b.password === 'string') mockCredentials.password = b.password
    }
    return { status: 201, data: mockUser }
  }

  if (/^\/users\/\d+$/.test(normalizedPath) && (verb === 'GET' || verb === 'PUT' || verb === 'DELETE')) {
    const id = parseInt(normalizedPath.split('/').pop() || '0')
    if (id !== mockUser.user_id) return { status: 404, error: 'Not found' }

    if (verb === 'DELETE') {
      return { status: 204, data: null }
    }

    if (verb === 'PUT') {
      // Shallow merge, preserve required fields
      const updated = { ...mockUser, ...(body && typeof body === 'object' ? body : {}) }
      return { status: 200, data: updated }
    }

    return { status: 200, data: mockUser }
  }

  if (normalizedPath === '/users/dashboard' && verb === 'GET') {
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

  // Diseases endpoints
  if (normalizedPath === '/diseases' && verb === 'GET') {
    return { status: 200, data: mockDiseases };
  }

  if (normalizedPath === '/diseases' && verb === 'POST') {
    // Minimal create; echo back payload with a new id
    const nextId = Math.max(...mockDiseases.map((d) => d.disease_id)) + 1
    const created = {
      disease_id: nextId,
      ...(body && typeof body === 'object' ? (body as any) : {}),
    }
    mockDiseases.push(created as any)
    return { status: 201, data: created }
  }

  if (normalizedPath.match(/^\/diseases\/\d+$/) && verb === 'GET') {
    const id = parseInt(normalizedPath.split('/').pop() || '0');
    const disease = mockDiseases.find((d) => d.disease_id === id);
    return disease ? { status: 200, data: disease } : { status: 404, error: 'Not found' };
  }

  // Scans endpoints
  if (normalizedPath === '/scans' && verb === 'GET') {
    return { status: 200, data: mockScans };
  }

  if (normalizedPath.match(/^\/scans\/\d+$/) && verb === 'GET') {
    const id = parseInt(normalizedPath.split('/').pop() || '0');
    const scan = mockScans.find((s) => s.scan_id === id);
    return scan ? { status: 200, data: scan } : { status: 404, error: 'Not found' };
  }

  if (normalizedPath === '/scans' && verb === 'POST') {
    const newScan = {
      scan_id: mockScans.length + 1,
      user_id: mockUser.user_id,
      image_url: '/img/scan-leaf.png',
      created_at: new Date().toISOString(),
      disease_id: null,
      confidence_score: null,
    };
    mockScans.push(newScan as any)
    return { status: 201, data: newScan };
  }

  // AI Predict endpoints
  if (normalizedPath.startsWith('/ai/predict') && verb === 'POST') {
    return {
      status: 200,
      data: {
        scan_id: 1,
        disease_id: 1,
        predicted_disease: 'Black Pod Disease',
        confidence_score: 0.87,
        recommendations: ['Apply fungicide', 'Monitor regularly'],
      },
    };
  }

  if (normalizedPath === '/ai/voice-diagnose' && verb === 'POST') {
    return {
      status: 200,
      data: {
        transcript: 'The pod appears to have dark spots',
        disease_id: 1,
        confidence_score: 0.75,
      },
    };
  }

  // Consultations endpoints
  if (normalizedPath === '/consultations' && verb === 'GET') {
    return { status: 200, data: mockConsultations };
  }

  if (normalizedPath === '/consultations' && verb === 'POST') {
    const newConsult = {
      consultation_id: mockConsultations.length + 1,
      user_id: mockUser.user_id,
      scan_id: 1,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    return { status: 201, data: newConsult };
  }

  // History endpoints
  if (normalizedPath === '/history' && verb === 'GET') {
    // legacy convenience
    return { status: 200, data: { total_scans: mockScans.length, scans: [] } };
  }

  if (/^\/history\/\d+$/.test(normalizedPath) && verb === 'GET') {
    const userId = parseInt(normalizedPath.split('/').pop() || '0')
    if (userId !== mockUser.user_id) {
      return { status: 404, error: 'Not found' }
    }

    const scans = mockScans.map((scan) => {
      const disease = mockDiseases.find((d) => d.disease_id === scan.disease_id)
      const urgency_level = (disease?.urgency_level || 'low') as string
      return {
        scan_id: scan.scan_id,
        disease_name: disease?.name || 'Unknown',
        urgency_level,
        image_preview_url: scan.image_url,
        created_at: scan.created_at,
        status_color: urgency_level === 'high' ? '#DC2626' : urgency_level === 'medium' ? '#F59E0B' : '#16A34A',
      }
    })

    return { status: 200, data: { total_scans: mockScans.length, scans } }
  }

  if (/^\/history\/\d+\/\d+$/.test(normalizedPath) && verb === 'POST') {
    // Accept and pretend it saved to history
    return { status: 201, data: { ok: true } }
  }

  // Experts endpoints
  if (normalizedPath === '/experts' && verb === 'GET') {
    return { status: 200, data: mockExperts }
  }

  if (/^\/experts\/\d+$/.test(normalizedPath) && verb === 'GET') {
    const id = parseInt(normalizedPath.split('/').pop() || '0')
    const expert = mockExperts.find((e) => e.expert_id === id)
    return expert ? { status: 200, data: expert } : { status: 404, error: 'Not found' }
  }

  // Messages endpoints
  if (normalizedPath === '/messages' && verb === 'GET') {
    return { status: 200, data: mockThreads }
  }

  if (/^\/messages\/\d+$/.test(normalizedPath) && verb === 'GET') {
    const id = parseInt(normalizedPath.split('/').pop() || '0')
    const thread = mockThreads.find((t) => t.thread_id === id)
    if (!thread) return { status: 404, error: 'Not found' }
    const messages = mockMessages
      .filter((m) => m.thread_id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    return { status: 200, data: { thread, messages } }
  }

  // Default: return null to indicate no mock for this endpoint
  return null;
}
