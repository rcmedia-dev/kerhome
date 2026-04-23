import { create } from 'zustand';

interface UIStore {
  isAuthModalOpen: boolean;
  authModalMode: 'signIn' | 'signUp';
  openAuthModal: (mode?: 'signIn' | 'signUp') => void;
  closeAuthModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isAuthModalOpen: false,
  authModalMode: 'signIn',
  openAuthModal: (mode = 'signIn') => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
