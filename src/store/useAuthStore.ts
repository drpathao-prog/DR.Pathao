import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { User as AppUser } from '../types';

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  isEditingProfile: boolean;
  setUser: (user: AppUser | null) => void;
  setProfileLoading: (loading: boolean) => void;
  setEditingProfile: (editing: boolean) => void;
  logout: () => Promise<void>;
}

let unsubProfile: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isProfileLoading: false,
  isEditingProfile: false,
  setUser: (user) => set({ user, isLoading: false, isProfileLoading: false }),
  setProfileLoading: (loading) => set({ isProfileLoading: loading }),
  setEditingProfile: (editing) => set({ isEditingProfile: editing }),
  logout: async () => {
    if (unsubProfile) {
      unsubProfile();
      unsubProfile = null;
    }
    await auth.signOut();
    set({ user: null, isLoading: false, isProfileLoading: false });
  }
}));

// Initialize listener
onAuthStateChanged(auth, (firebaseUser) => {
  if (unsubProfile) {
    unsubProfile();
    unsubProfile = null;
  }

  if (firebaseUser) {
    useAuthStore.getState().setProfileLoading(true);
    // Listen to Firestore profile
    unsubProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        useAuthStore.getState().setUser(snapshot.data() as AppUser);
      } else {
        // Fallback for new users before initial profile doc is created
        useAuthStore.getState().setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'No Name',
          email: firebaseUser.email || 'No Email',
          phone: '',
          avatar: firebaseUser.photoURL || '',
          role: 'patient',
          onboardingComplete: false
        });
      }
    }, (error) => {
      console.error("Profile sync error:", error);
      useAuthStore.getState().setUser(null);
    });
  } else {
    useAuthStore.getState().setUser(null);
  }
});
