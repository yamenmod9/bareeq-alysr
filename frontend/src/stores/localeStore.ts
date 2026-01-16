import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LocaleState {
  language: Language;
  direction: Direction;
}

interface LocaleActions {
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

type LocaleStore = LocaleState & LocaleActions;

const getDirection = (language: Language): Direction => {
  return language === 'ar' ? 'rtl' : 'ltr';
};

const applyDirection = (direction: Direction) => {
  document.documentElement.dir = direction;
  document.documentElement.lang = direction === 'rtl' ? 'ar' : 'en';
};

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set, get) => ({
      // State
      language: 'ar',
      direction: 'rtl',

      // Actions
      setLanguage: (language: Language) => {
        const direction = getDirection(language);
        
        set({ language, direction });
        
        // Update i18n
        i18n.changeLanguage(language);
        
        // Update HTML attributes
        applyDirection(direction);
        
        // Update localStorage for i18n detector
        localStorage.setItem('i18nextLng', language);
      },

      toggleLanguage: () => {
        const current = get().language;
        const newLanguage: Language = current === 'ar' ? 'en' : 'ar';
        get().setLanguage(newLanguage);
      },
    }),
    {
      name: 'locale-storage',
      onRehydrateStorage: () => (state) => {
        // Apply direction after rehydration
        if (state) {
          applyDirection(state.direction);
          i18n.changeLanguage(state.language);
        }
      },
    }
  )
);
