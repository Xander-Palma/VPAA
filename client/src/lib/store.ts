import { create } from 'zustand';

// Types used by the frontend (kept simple and matching backend fields)
export type UserRole = 'admin' | 'participant';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
  [key: string]: any;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  timeStart?: string;
  timeEnd?: string;
  location?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | string;
  participantsCount: number;
  requirements?: Record<string, any>;
  participants?: Participant[];
}


export interface Participant {
  id: string;
  event: string | number;
  user?: string | number | null;
  name: string;
  email: string;
  status: 'registered' | 'attended' | 'completed' | string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  hasEvaluated?: boolean;
  evaluationData?: any;
  certificate?: {
    certificate_number: string;
    verification_code: string;
    issued_at?: string;
    emailed?: boolean;
  } | null;
}

interface AppState {
  currentUser: User | null;
  token: string | null;
  events: Event[];
  participants: Record<string, Participant[]>; // eventId -> participants
  login: (usernameOrUser: any, password?: string) => Promise<void>;
  logout: () => void;
  fetchEvents: () => Promise<void>;
  addEvent: (event: Partial<Event>) => Promise<Event | null>;
  updateEvent: (id: string | number, event: Partial<Event>) => Promise<Event | null>;
  deleteEvent: (id: string | number) => Promise<boolean>;
  joinEvent: (eventId: string | number, a?: any, b?: any) => Promise<Participant | null>;
    markAttendance: (participantId: string | number, status?: string) => Promise<Participant | null>;
  submitEvaluation: (participantId: string | number, data: any) => Promise<Participant | null>;
  issueCertificate: (eventId: string | number, participantId: string | number) => Promise<any>;
  downloadCertificate: (certificateId: string | number) => Promise<boolean>;
  concludeEvent: (eventId: string | number) => Promise<Event | null>;
  uploadParticipants: (eventId: string | number, file: File) => Promise<any>;
  register: (email: string, name: string, password: string) => Promise<void>;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8000/api';

function normalizeEvent(raw: any): Event {
  return {
    id: String(raw.id),
    title: raw.title,
    description: raw.description,
    date: raw.date,
    timeStart: raw.time_start ?? raw.timeStart,
    timeEnd: raw.time_end ?? raw.timeEnd,
    location: raw.location,
    status: raw.status,
    participantsCount: raw.participants_count ?? raw.participantsCount ?? 0,
    requirements: raw.requirements ?? raw.requirements,
    participants: Array.isArray(raw.participants) ? raw.participants.map(normalizeParticipant) : [],
  };
}

function normalizeParticipant(raw: any): Participant {
  return {
    id: String(raw.id),
    event: String(raw.event) || raw.event,
    user: raw.user ? (typeof raw.user === 'object' ? raw.user.id : raw.user) : null,
    name: raw.name,
    email: raw.email,
    status: raw.status,
    checkInTime: raw.check_in_time ?? raw.checkInTime ?? null,
    checkOutTime: raw.check_out_time ?? raw.checkOutTime ?? null,
    hasEvaluated: raw.has_evaluated ?? raw.hasEvaluated ?? false,
    evaluationData: raw.evaluation_data ?? raw.evaluationData ?? null,
    certificate: raw.certificate || null,
  };
}

function authHeaders(token?: string): Record<string, string> {
  const t = token ?? localStorage.getItem('token');
  return t ? { Authorization: `Token ${t}` } : {};
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const useStore = create<AppState>((set, get) => {
  // helper to set user + token
  function setAuth(user: User | null, token: string | null) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ currentUser: user, token });
  }

  // Initial state
  const state: AppState = {
    currentUser: null,
    token: localStorage.getItem('token'),
    events: [],
    participants: {},

      // login can accept either (username, password) or a user object (legacy mock)
      login: async (usernameOrUser: any, password?: string) => {
        // Legacy path: called with a user object from existing UI mock
          if (typeof usernameOrUser === 'object') {
            const userObj: User = usernameOrUser as User;
            // do not set a token when using the local mock user
            setAuth(userObj, null);
            // ensure we populate events/participants for the legacy mock user
            try {
              await get().fetchEvents();
            } catch (e) {
              console.error('fetchEvents failed after legacy login', e);
            }
            return;
          }

        const username = usernameOrUser as string;
        if (!username || !password) {
          throw new Error('Missing credentials');
        }

        const res = await fetch(`${API_BASE}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
          const err = await safeJson(res as unknown as Response);
          // err might be a string or object
          const message = (err && typeof err === 'object' && err.detail) ? err.detail : (typeof err === 'string' ? err : 'Login failed');
          throw new Error(message);
        }
        const data = await res.json();
        const token = data.token;
        const user = data.user;
        // Set role based on email
        if (user) {
          if (user.email === 'adminvpaa@gmail.com' || user.is_staff || user.is_superuser) {
            user.role = 'admin';
          } else {
            user.role = 'participant';
          }
        }
        setAuth(user, token);
        // fetch events after login
        await get().fetchEvents();
      },

    logout: () => {
      localStorage.removeItem('token');
      set({ currentUser: null, token: null, events: [], participants: {} });
    },

    fetchEvents: async () => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/events/`, { headers });
      if (!res.ok) {
        return;
      }
      const data: any[] = await res.json();
      const events = data.map(normalizeEvent);
      const participantsMap: Record<string, Participant[]> = {};
      events.forEach((e) => {
        participantsMap[String(e.id)] = e.participants ?? [];
      });
      set({ events, participants: participantsMap });
    },

    addEvent: async (event) => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/events/`, { method: 'POST', headers, body: JSON.stringify(event) });
      if (!res.ok) return null;
      const createdRaw: any = await res.json();
      const created = normalizeEvent(createdRaw);
      set((s) => {
        const participantsMap = { ...s.participants };
        participantsMap[String(created.id)] = created.participants ?? [];
        return { 
          events: [created, ...s.events],
          participants: participantsMap
        };
      });
      return created;
    },

    updateEvent: async (id, event) => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/events/${id}/`, { method: 'PATCH', headers, body: JSON.stringify(event) });
      if (!res.ok) return null;
      const updatedRaw: any = await res.json();
      const updated = normalizeEvent(updatedRaw);
      set((s) => {
        const participantsMap = { ...s.participants };
        participantsMap[String(id)] = updated.participants ?? [];
        return { 
          events: s.events.map((e) => (String(e.id) === String(id) ? updated : e)),
          participants: participantsMap
        };
      });
      return updated;
    },

    deleteEvent: async (id) => {
      const headers: Record<string,string> = { ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/events/${id}/`, { method: 'DELETE', headers });
      if (!res.ok) return false;
      set((s) => ({ events: s.events.filter((e) => String(e.id) !== String(id)) }));
      return true;
    },

    joinEvent: async (eventId, a?, b?) => {
      // support either (eventId, name, email) or (eventId, userObject)
      let name: string;
      let email: string;
      if (typeof a === 'object' && a !== null) {
        const userObj = a as any;
        name = userObj.name || userObj.first_name || userObj.username || 'Anonymous';
        email = userObj.email || '';
      } else {
        name = a ?? 'Anonymous';
        email = b ?? '';
      }

      const headers: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/events/${eventId}/join/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        const error = await safeJson(res as unknown as Response);
        const errorMsg = (error && typeof error === 'object' && error.error) ? error.error : (typeof error === 'string' ? error : 'Failed to join event');
        throw new Error(errorMsg);
      }
      const participantRaw: any = await res.json();
      const participant = normalizeParticipant(participantRaw);
      // Ensure event ID is set correctly
      participant.event = String(eventId);
      
      // update participants and events immediately - DO THIS FIRST
      set((s) => {
        const key = String(eventId);
        const list = s.participants[key] ?? [];
        // Check if participant already exists in list
        const exists = list.some(p => 
          String(p.id) === String(participant.id) || 
          (p.email === participant.email && String(p.event) === String(eventId)) ||
          (p.user && participant.user && String(p.user) === String(participant.user))
        );
        const updatedList = exists ? list.map(p => 
          (String(p.id) === String(participant.id) || 
           (p.email === participant.email && String(p.event) === String(eventId)) ||
           (p.user && participant.user && String(p.user) === String(participant.user))) 
            ? participant 
            : p
        ) : [...list, participant];
        return {
          participants: { ...s.participants, [key]: updatedList },
          events: s.events.map((ev) => (String(ev.id) === key ? { ...ev, participantsCount: (ev.participantsCount || 0) + 1 } : ev)),
        };
      });
      
      // Refresh events AFTER updating local state to merge with server data
      // This ensures the admin panel sees the participant too
      await new Promise(resolve => setTimeout(resolve, 200));
      const currentState = get();
      await currentState.fetchEvents();
      // After fetchEvents, merge the participant we just added to ensure it's still there
      set((s) => {
        const key = String(eventId);
        const serverList = s.participants[key] ?? [];
        const existsInServer = serverList.some(p => 
          String(p.id) === String(participant.id) ||
          (p.email === participant.email && String(p.event) === String(eventId)) ||
          (p.user && participant.user && String(p.user) === String(participant.user))
        );
        if (!existsInServer) {
          return {
            participants: { ...s.participants, [key]: [...serverList, participant] }
          };
        }
        return {};
      });
      return participant;
    },

    markAttendance: async (participantId, status = 'attended') => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/participants/${participantId}/mark_attendance/`, { 
        method: 'POST', 
        headers, 
        body: JSON.stringify({ type: 'in' }) 
      });
      if (!res.ok) {
        const err = await safeJson(res as unknown as Response);
        throw new Error(err?.error || err?.detail || 'Failed to mark attendance');
      }
      const updatedRaw: any = await res.json();
      const updated = normalizeParticipant(updatedRaw);
      // update participants map
      set((s) => {
        const newMap = { ...s.participants };
        Object.keys(newMap).forEach((k) => {
          newMap[k] = newMap[k].map((p) => (String(p.id) === String(participantId) ? updated : p));
        });
        return { participants: newMap };
      });
      return updated;
    },

    submitEvaluation: async (participantId, data) => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/participants/${participantId}/submit_evaluation/`, { 
        method: 'POST', 
        headers, 
        body: JSON.stringify({ evaluation_data: data }) 
      });
      if (!res.ok) {
        const err = await safeJson(res as unknown as Response);
        throw new Error(err?.error || err?.detail || 'Failed to submit evaluation');
      }
      const updatedRaw: any = await res.json();
      const updated = normalizeParticipant(updatedRaw);
      set((s) => {
        const newMap = { ...s.participants };
        Object.keys(newMap).forEach((k) => {
          newMap[k] = newMap[k].map((p) => (String(p.id) === String(participantId) ? updated : p));
        });
        return { participants: newMap };
      });
      return updated;
    },

    issueCertificate: async (eventId, participantId) => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/participants/${participantId}/issue_certificate/`, { 
        method: 'POST', 
        headers, 
        body: JSON.stringify({ send_email: true }) 
      });
      if (!res.ok) {
        const err = await safeJson(res as unknown as Response);
        throw new Error(err?.error || err?.detail || 'Failed to issue certificate');
      }
      const certData: any = await res.json();
      // Refresh events to get updated participant data with certificates
      await get().fetchEvents();
      return certData;
    },
    downloadCertificate: async (certificateId) => {
      const headers: Record<string,string> = { ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/certificates/${certificateId}/download/`, { headers });
      if (!res.ok) return false;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    },
    concludeEvent: async (eventId) => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/events/${eventId}/conclude/`, { method: 'POST', headers });
      if (!res.ok) return null;
      const updatedRaw: any = await res.json();
      const updated = normalizeEvent(updatedRaw.event);
      set((s) => {
        const participantsMap = { ...s.participants };
        participantsMap[String(eventId)] = updated.participants ?? [];
        return { 
          events: s.events.map((e) => (String(e.id) === String(eventId) ? updated : e)),
          participants: participantsMap
        };
      });
      return updated;
    },
    uploadParticipants: async (eventId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      const headers: Record<string,string> = { ...authHeaders(get().token ?? undefined) };
      delete headers['Content-Type']; // Let browser set multipart boundary
      const res = await fetch(`${API_BASE}/events/${eventId}/upload_participants/`, { 
        method: 'POST', 
        headers, 
        body: formData 
      });
      if (!res.ok) {
        const err = await safeJson(res as unknown as Response);
        throw new Error(err?.error || 'Failed to upload participants');
      }
      await get().fetchEvents();
      return await res.json();
    },

    register: async (email, name, password) => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      const res = await fetch(`${API_BASE}/auth/register/`, { method: 'POST', headers, body: JSON.stringify({ email, password, name }) });
      if (!res.ok) {
        const err = await safeJson(res as unknown as Response);
        const message = (err && typeof err === 'object' && err.detail) ? err.detail : (typeof err === 'string' ? err : 'Register failed');
        throw new Error(message);
      }
      const data = await res.json();
      const token = data.token;
      const user = data.user;
      // Set role for participant (not admin)
      if (user && user.email !== 'adminvpaa@gmail.com') {
        user.role = 'participant';
      }
      setAuth(user, token);
      try {
        await get().fetchEvents();
      } catch (e) {
        console.error('fetchEvents failed after register', e);
      }
    },
  };

  // try to load current user + events if token exists
  (async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const meHeaders: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(token) };
      const meRes = await fetch(`${API_BASE}/auth/me/`, { headers: meHeaders });
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData?.user) set({ currentUser: meData.user, token });
      }
      // fetch events
      await state.fetchEvents();
    } catch (e) {
      console.error('Failed to load initial data', e);
    }
  })();

  return state;
});
