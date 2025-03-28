import { atom } from 'recoil';

export type Theme = 'light' | 'dark';

// Initialize theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem('theme') as Theme;
  if (savedTheme) return savedTheme;
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const themeState = atom<Theme>({
  key: 'themeState',
  default: getInitialTheme(),
}); 