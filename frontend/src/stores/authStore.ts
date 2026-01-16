import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/models';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  role: 'customer' | 'merchant' | 'admin' | null;
}

interface AuthActions {
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      token: null,
      user: null,
      isAuthenticated: false,
      role: null,

      // Actions
      setAuth: (token: string, user: User) => {
        localStorage.setItem('auth_token', token);
        set({
          token,
          user,
          isAuthenticated: true,
          role: user.role,
        });
      },

      clearAuth: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          role: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      checkAuth: () => {
        const token = get().token || localStorage.getItem('auth_token');
        if (!token) {
          get().clearAuth();
          return false;
        }

        // Check if token is expired by decoding JWT
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = payload.exp * 1000 < Date.now();
          if (isExpired) {
            get().clearAuth();
            return false;
          }
        } catch {
          get().clearAuth();
          return false;
        }

        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
      onRehydrateStorage: () => (state) => {
        // After hydration, verify the token is still valid
        if (state?.token) {
          try {
            const payload = JSON.parse(atob(state.token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            if (isExpired) {
              // Token expired, clear auth
              state.clearAuth();
            }
          } catch {
            // Invalid token, clear auth
            state.clearAuth();
          }
        }
      },
    }
  )
);
