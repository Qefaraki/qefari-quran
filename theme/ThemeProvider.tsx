import { createContext, useContext, ReactNode } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { themes, ThemeColors } from './colors'

const ThemeContext = createContext<ThemeColors>(themes['gold-dark'])

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { themeId } = useSettingsStore()
  const theme = themes[themeId as keyof typeof themes] || themes['gold-dark']

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeColors {
  return useContext(ThemeContext)
}
