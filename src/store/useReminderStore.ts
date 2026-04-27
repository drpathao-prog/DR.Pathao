import { create } from 'zustand';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  taken: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface ReminderState {
  medicines: Medication[];
  isLoading: boolean;
  error: string | null;
  toggleMedicine: (id: string) => Promise<void>;
  addMedicine: (med: Omit<Medication, 'id' | 'userId' | 'taken' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  subscribe: () => (() => void);
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  medicines: [],
  isLoading: true,
  error: null,

  subscribe: () => {
    const user = auth.currentUser;
    if (!user) {
      set({ medicines: [], isLoading: false });
      return () => {};
    }

    const path = `users/${user.uid}/reminders`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const medicines = snapshot.docs.map(doc => ({ 
        ...(doc.data() as Medication),
        id: doc.id 
      }));
      set({ medicines, isLoading: false });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      set({ error: error.message, isLoading: false });
    });

    return unsubscribe;
  },

  toggleMedicine: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    const med = get().medicines.find(m => m.id === id);
    if (!med) return;

    const path = `users/${user.uid}/reminders/${id}`;
    try {
      await updateDoc(doc(db, path), {
        taken: !med.taken,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  addMedicine: async (med) => {
    const user = auth.currentUser;
    if (!user) return;

    const id = Math.random().toString(36).substring(2, 9);
    const path = `users/${user.uid}/reminders/${id}`;
    
    try {
      await setDoc(doc(db, path), {
        ...med,
        id,
        userId: user.uid,
        taken: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  deleteMedicine: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    const path = `users/${user.uid}/reminders/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}));
