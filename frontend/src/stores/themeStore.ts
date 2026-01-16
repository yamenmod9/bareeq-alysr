import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  updateResolvedTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // State
      theme: 'dark',
      resolvedTheme: 'dark',

      // Actions
      setTheme: (theme: Theme) => {
        set({ theme });
        
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        set({ resolvedTheme: resolved });
        applyTheme(resolved);
      },

      toggleTheme: () => {
        const current = get().resolvedTheme;
        const newTheme = current === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },

      updateResolvedTheme: () => {
        const theme = get().theme;
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        set({ resolvedTheme: resolved });
        applyTheme(resolved);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme after rehydration
        if (state) {
          const resolved = state.theme === 'system' ? getSystemTheme() : state.theme;
          state.resolvedTheme = resolved;
          applyTheme(resolved);
        }
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      store.updateResolvedTheme();
    }
  });
}
