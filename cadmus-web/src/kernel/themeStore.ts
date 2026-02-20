import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'ivory' | 'pulp' | 'crt' | 'vapor';
export type FontFamily = 'mono' | 'sans' | 'serif';

interface ThemeState {
  theme: Theme;
  font: FontFamily;
  effects: {
      scanlines: boolean;
      texture: boolean;
  };
  setTheme: (theme: Theme) => void;
  setFont: (font: FontFamily) => void;
  toggleEffect: (effect: 'scanlines' | 'texture') => void;
  apply: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'ivory',
      font: 'mono',
      effects: {
          scanlines: false,
          texture: true
      },

      setTheme: (theme) => {
        set({ theme });
        get().apply();
      },

      setFont: (font) => {
          set({ font });
          get().apply();
      },

      toggleEffect: (effect) => {
          set((state) => ({ effects: { ...state.effects, [effect]: !state.effects[effect] } }));
          get().apply();
      },

      apply: () => {
        const { theme, font, effects } = get();
        const body = window.document.body;
        
        // Reset classes
        body.classList.remove('theme-ivory', 'theme-pulp', 'theme-crt', 'theme-vapor');
        body.classList.remove('font-mono', 'font-sans', 'font-serif');
        body.classList.remove('paper-texture', 'scanlines');
        
        // Apply Theme
        body.classList.add(`theme-${theme}`);

        // Apply Font
        document.documentElement.style.setProperty('--font-ui', 
            font === 'mono' ? "'IBM Plex Mono', monospace" :
            font === 'serif' ? "'Lora', serif" :
            "'Inter', sans-serif"
        );

        // Apply Effects
        if (effects.texture) body.classList.add('paper-texture');
        if (effects.scanlines) body.classList.add('scanlines');
      },
    }),
    {
      name: 'cadmus-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.apply();
        }
      }
    }
  )
);
