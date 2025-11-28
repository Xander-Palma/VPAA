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
  markAttendance: (participantId: string | number, status: string) => Promise<Participant | null>;
  submitEvaluation: (participantId: string | number, data: any) => Promise<Participant | null>;
  issueCertificate: (participantId: string | number) => Promise<Participant | null>;
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
    event: raw.event,
    user: raw.user ?? raw.user,
    name: raw.name,
    email: raw.email,
    status: raw.status,
    checkInTime: raw.check_in_time ?? raw.checkInTime ?? null,
    checkOutTime: raw.check_out_time ?? raw.checkOutTime ?? null,
    hasEvaluated: raw.has_evaluated ?? raw.hasEvaluated ?? false,
    evaluationData: raw.evaluation_data ?? raw.evaluationData ?? null,
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
      set((s) => ({ events: [created, ...s.events] }));
      return created;
    },

    updateEvent: async (id, event) => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/events/${id}/`, { method: 'PATCH', headers, body: JSON.stringify(event) });
      if (!res.ok) return null;
      const updatedRaw: any = await res.json();
      const updated = normalizeEvent(updatedRaw);
      set((s) => ({ events: s.events.map((e) => (String(e.id) === String(id) ? updated : e)) }));
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
      if (!res.ok) return null;
      const participantRaw: any = await res.json();
      const participant = normalizeParticipant(participantRaw);
      // update participants and events
      set((s) => {
        const key = String(eventId);
        const list = s.participants[key] ?? [];
        return {
          participants: { ...s.participants, [key]: [...list, participant] },
          events: s.events.map((ev) => (String(ev.id) === key ? { ...ev, participantsCount: (ev.participantsCount || 0) + 1 } : ev)),
        };
      });
      return participant;
    },

    markAttendance: async (participantId, status) => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/participants/${participantId}/`, { method: 'PATCH', headers, body: JSON.stringify({ status }) });
      if (!res.ok) return null;
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
      const res = await fetch(`${API_BASE}/participants/${participantId}/`, { method: 'PATCH', headers, body: JSON.stringify({ has_evaluated: true, evaluation_data: data }) });
      if (!res.ok) return null;
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

    issueCertificate: async (participantId) => {
      const headers: Record<string,string> = { 'Content-Type': 'application/json', ...authHeaders(get().token ?? undefined) };
      const res = await fetch(`${API_BASE}/participants/${participantId}/`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'completed' }) });
      if (!res.ok) return null;
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
