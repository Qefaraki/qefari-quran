export interface ThemeColors {
  primary: string
  primaryLight: string
  background: string
  surface: string
  surfaceElevated: string
  text: string
  textSecondary: string
  textMuted: string
  border: string
  success: string
  error: string
  warning: string
}

export type ThemeId =
  | 'gold-light'
  | 'gold-dark'
  | 'emerald-light'
  | 'emerald-dark'
  | 'rose-light'
  | 'rose-dark'
  | 'purple-light'
  | 'purple-dark'
  | 'amber-light'
  | 'amber-dark'

export const themes: Record<ThemeId, ThemeColors> = {
  'gold-light': {
    primary: '#D4AF37',
    primaryLight: '#E8D085',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceElevated: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E0E0E0',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'gold-dark': {
    primary: '#D4AF37',
    primaryLight: '#E8D085',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    surfaceElevated: '#3A3A3A',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textMuted: '#666666',
    border: '#3A3A3A',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'emerald-light': {
    primary: '#10B981',
    primaryLight: '#6EE7B7',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceElevated: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E0E0E0',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'emerald-dark': {
    primary: '#10B981',
    primaryLight: '#6EE7B7',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    surfaceElevated: '#3A3A3A',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textMuted: '#666666',
    border: '#3A3A3A',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'rose-light': {
    primary: '#F43F5E',
    primaryLight: '#FB7185',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceElevated: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E0E0E0',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'rose-dark': {
    primary: '#F43F5E',
    primaryLight: '#FB7185',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    surfaceElevated: '#3A3A3A',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textMuted: '#666666',
    border: '#3A3A3A',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'purple-light': {
    primary: '#A855F7',
    primaryLight: '#C084FC',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceElevated: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E0E0E0',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'purple-dark': {
    primary: '#A855F7',
    primaryLight: '#C084FC',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    surfaceElevated: '#3A3A3A',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textMuted: '#666666',
    border: '#3A3A3A',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'amber-light': {
    primary: '#F59E0B',
    primaryLight: '#FCD34D',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceElevated: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E0E0E0',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'amber-dark': {
    primary: '#F59E0B',
    primaryLight: '#FCD34D',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    surfaceElevated: '#3A3A3A',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textMuted: '#666666',
    border: '#3A3A3A',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
}
