import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  avatar_url?: string | null;
  email?: string | null;
  token?: string | null;
}

interface AuthState {
  user: User | null;
  vaultSecret: string | null; // The master password/key used for E2EE
  _hasHydrated: boolean;
  
  setUser: (user: User | null) => void;
  setVaultSecret: (secret: string | null) => void;
  setHasHydrated: (val: boolean) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      vaultSecret: sessionStorage.getItem('cadmus-vault-session') || null,
      _hasHydrated: false,

      setUser: (user) => set({ user }),
      setVaultSecret: (secret) => {
          if (secret) sessionStorage.setItem('cadmus-vault-session', secret);
          else sessionStorage.removeItem('cadmus-vault-session');
          set({ vaultSecret: secret });
      },
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),
      logout: () => {
          sessionStorage.removeItem('cadmus-vault-session');
          set({ user: null, vaultSecret: null });
          localStorage.removeItem('cadmus-auth-storage');
      },
    }),
    {
      name: 'cadmus-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the 'user' object, keep 'vaultSecret' in memory only
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: (state) => {
        return (_rehydratedState, error) => {
            if (error) {
                console.error("Hydration failed", error);
            }
            state.setHasHydrated(true);
            
            // Detect if running in Tauri
            const isTauri = typeof window !== 'undefined' && (!!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__);

            // Cleanup stale sessions only if NOT in Tauri
            if (!isTauri && _rehydratedState?.user && !_rehydratedState.user.token) {
                _rehydratedState.logout();
            }
        };
      }
    }
  )
);
