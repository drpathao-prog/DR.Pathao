import { create } from 'zustand';

interface UIState {
  isLoginModalOpen: boolean;
  isOnboardingModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  setOnboardingModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoginModalOpen: false,
  isOnboardingModalOpen: false,
  setLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),
  setOnboardingModalOpen: (open: boolean) => set({ isOnboardingModalOpen: open }),
}));
