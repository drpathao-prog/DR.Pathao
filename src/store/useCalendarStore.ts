import { create } from 'zustand';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import dayjs from '../utils/date';
import { CalendarEvent } from '../types';

interface CalendarState {
  events: CalendarEvent[];
  globalEvents: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleEventStatus: (id: string) => Promise<void>;
  subscribe: () => (() => void);
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  globalEvents: [],
  isLoading: true,
  error: null,

  subscribe: () => {
    const user = auth.currentUser;
    if (!user) {
      set({ events: [], globalEvents: [], isLoading: false });
      return () => {};
    }

    const userPath = `users/${user.uid}/events`;
    const globalPath = `master_calendar`;

    const userQuery = query(collection(db, userPath), orderBy('date', 'asc'));
    const globalQuery = query(
      collection(db, globalPath), 
      orderBy('date', 'asc')
    );

    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ 
        ...(doc.data() as CalendarEvent),
        id: doc.id 
      }));
      set({ events });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, userPath);
      set({ error: error.message });
    });

    const unsubscribeGlobal = onSnapshot(globalQuery, (snapshot) => {
      const allGlobalEvents = snapshot.docs.map(doc => ({ 
        ...(doc.data() as CalendarEvent),
        id: doc.id 
      }));
      // Filter public events in client to avoid needing composite indexes or hitting SDK assertion bugs
      const globalEvents = allGlobalEvents.filter(e => e.type === 'public');
      set({ globalEvents, isLoading: false });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, globalPath);
      // Global calendar might not exist yet or have different permissions in some setups
      set({ globalEvents: [] });
    });

    return () => {
      unsubscribeUser();
      unsubscribeGlobal();
    };
  },

  addEvent: async (event) => {
    const user = auth.currentUser;
    if (!user) return;

    const id = Math.random().toString(36).substring(2, 9);
    const path = `users/${user.uid}/events/${id}`;

    try {
      await setDoc(doc(db, path), {
        ...event,
        id,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  updateEvent: async (id, updatedEvent) => {
    const user = auth.currentUser;
    if (!user) return;

    const path = `users/${user.uid}/events/${id}`;
    try {
      await updateDoc(doc(db, path), {
        ...updatedEvent,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  deleteEvent: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    const path = `users/${user.uid}/events/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  toggleEventStatus: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    const event = get().events.find(e => e.id === id);
    if (!event) return;

    const path = `users/${user.uid}/events/${id}`;
    try {
      await updateDoc(doc(db, path), {
        status: event.status === 'completed' ? 'pending' : 'completed',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
}));
