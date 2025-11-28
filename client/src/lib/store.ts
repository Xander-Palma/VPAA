import { create } from 'zustand';
import { z } from 'zod';

// Mock Data Types
export type UserRole = 'admin' | 'participant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participantsCount: number;
  requirements: {
    attendance: boolean;
    evaluation: boolean;
    quiz: boolean;
  };
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  status: 'registered' | 'attended' | 'completed';
  checkInTime?: string;
  checkOutTime?: string;
  hasEvaluated?: boolean;
  evaluationData?: any;
}

// Mock Store
interface AppState {
  currentUser: User | null;
  events: Event[];
  participants: Record<string, Participant[]>; // eventId -> participants
  login: (user: User) => void;
  logout: () => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  joinEvent: (eventId: string, user: User) => void;
  markAttendance: (eventId: string, participantId: string, status: 'registered' | 'attended' | 'completed') => void;
  submitEvaluation: (eventId: string, participantId: string, data: any) => void;
  issueCertificate: (eventId: string, participantId: string) => void;
}

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Research Seminar 2025',
    description: 'Annual research seminar for faculty and students.',
    date: '2025-11-30',
    timeStart: '08:00',
    timeEnd: '17:00',
    location: 'Main Auditorium',
    status: 'upcoming',
    participantsCount: 45,
    requirements: { attendance: true, evaluation: true, quiz: false }
  },
  {
    id: '2',
    title: 'Web Development Workshop',
    description: 'Hands-on workshop on modern web technologies.',
    date: '2025-11-28',
    timeStart: '13:00',
    timeEnd: '16:00',
    location: 'Computer Lab 3',
    status: 'ongoing',
    participantsCount: 28,
    requirements: { attendance: true, evaluation: true, quiz: true }
  },
  {
    id: '3',
    title: 'Leadership Training',
    description: 'Training for student organization leaders.',
    date: '2025-11-15',
    timeStart: '09:00',
    timeEnd: '12:00',
    location: 'Conference Room A',
    status: 'completed',
    participantsCount: 32,
    requirements: { attendance: true, evaluation: true, quiz: false }
  }
];

export const MOCK_PARTICIPANTS: Record<string, Participant[]> = {
  '1': [
    { id: 'p1', name: 'John Doe', email: 'john@hcdc.edu.ph', status: 'registered' },
    { id: 'p2', name: 'Jane Smith', email: 'jane@hcdc.edu.ph', status: 'registered' }
  ],
  '2': [
    { id: 'p3', name: 'Alice Johnson', email: 'alice@hcdc.edu.ph', status: 'attended', checkInTime: '12:55', checkOutTime: '16:05', hasEvaluated: false },
    { id: 'p4', name: 'Bob Wilson', email: 'bob@hcdc.edu.ph', status: 'attended', checkInTime: '13:00', hasEvaluated: false }
  ],
  '3': []
};

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  events: MOCK_EVENTS,
  participants: MOCK_PARTICIPANTS,
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
  addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),
  updateEvent: (id, updatedEvent) => set((state) => ({
    events: state.events.map((e) => (e.id === id ? { ...e, ...updatedEvent } : e))
  })),
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id)
  })),
  joinEvent: (eventId, user) => set((state) => {
    const currentParticipants = state.participants[eventId] || [];
    if (currentParticipants.find(p => p.email === user.email)) return state;
    
    return {
      participants: {
        ...state.participants,
        [eventId]: [
          ...currentParticipants,
          { id: user.id, name: user.name, email: user.email, status: 'registered' }
        ]
      },
      events: state.events.map(e => e.id === eventId ? { ...e, participantsCount: e.participantsCount + 1 } : e)
    };
  }),
  markAttendance: (eventId, participantId, status) => set((state) => {
    const eventParticipants = state.participants[eventId] || [];
    const updatedParticipants = eventParticipants.map(p => 
      p.id === participantId 
        ? { ...p, status, checkInTime: status === 'attended' ? new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : undefined } 
        : p
    );
    return {
      participants: {
        ...state.participants,
        [eventId]: updatedParticipants
      }
    };
  }),
  submitEvaluation: (eventId, participantId, data) => set((state) => {
    const eventParticipants = state.participants[eventId] || [];
    const updatedParticipants = eventParticipants.map(p => 
      p.id === participantId 
        ? { ...p, hasEvaluated: true, evaluationData: data } 
        : p
    );
    return {
      participants: {
        ...state.participants,
        [eventId]: updatedParticipants
      }
    };
  }),
  issueCertificate: (eventId, participantId) => set((state) => {
     const eventParticipants = state.participants[eventId] || [];
     const updatedParticipants = eventParticipants.map(p => 
       p.id === participantId ? { ...p, status: 'completed' as const } : p
     );
     return {
       participants: {
         ...state.participants,
         [eventId]: updatedParticipants
       }
     };
  })
}));
