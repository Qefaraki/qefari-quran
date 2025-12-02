import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mmkvStorage } from '../lib/mmkv'

export type Language = 'system' | 'en' | 'ar'
export type NumeralStyle = 'western' | 'arabic' | 'system'
export type CalendarType = 'gregorian' | 'hijri'
export type CalculationMethod =
  | 'ummAlQura'
  | 'muslimWorldLeague'
  | 'isna'
  | 'karachi'
  | 'singapore'
  | 'egyptian'
  | 'turkey'
  | 'kuwait'
  | 'qatar'

export interface NotificationSetting {
  adhan: boolean
  iqama: boolean
  iqamaMinutes: number
}

export interface NotificationSettings {
  fajr: NotificationSetting
  sunrise: { adhan: boolean }
  dhuhr: NotificationSetting
  asr: NotificationSetting
  maghrib: NotificationSetting
  isha: NotificationSetting
}

export interface ManualLocation {
  lat: number
  lon: number
  city: string
}

interface SettingsState {
  // Display
  language: Language
  numeralStyle: NumeralStyle
  calendarType: CalendarType
  themeId: string
  hapticsEnabled: boolean

  // Prayer
  calculationMethod: CalculationMethod
  notifications: NotificationSettings

  // Location
  useManualLocation: boolean
  manualLocation: ManualLocation | null

  // Actions
  setLanguage: (language: Language) => void
  setNumeralStyle: (style: NumeralStyle) => void
  setCalendarType: (type: CalendarType) => void
  setTheme: (themeId: string) => void
  setHapticsEnabled: (enabled: boolean) => void
  setCalculationMethod: (method: CalculationMethod) => void
  setNotifications: (settings: NotificationSettings) => void
  setUseManualLocation: (use: boolean) => void
  setManualLocation: (location: ManualLocation | null) => void
}

const defaultNotifications: NotificationSettings = {
  fajr: { adhan: true, iqama: true, iqamaMinutes: 20 },
  sunrise: { adhan: true },
  dhuhr: { adhan: true, iqama: true, iqamaMinutes: 20 },
  asr: { adhan: true, iqama: true, iqamaMinutes: 20 },
  maghrib: { adhan: true, iqama: true, iqamaMinutes: 10 },
  isha: { adhan: true, iqama: true, iqamaMinutes: 20 },
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'system',
      numeralStyle: 'system',
      calendarType: 'gregorian',
      themeId: 'gold-dark',
      hapticsEnabled: true,
      calculationMethod: 'ummAlQura',
      notifications: defaultNotifications,
      useManualLocation: false,
      manualLocation: null,

      setLanguage: (language) => set({ language }),
      setNumeralStyle: (numeralStyle) => set({ numeralStyle }),
      setCalendarType: (calendarType) => set({ calendarType }),
      setTheme: (themeId) => set({ themeId }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setCalculationMethod: (calculationMethod) => set({ calculationMethod }),
      setNotifications: (notifications) => set({ notifications }),
      setUseManualLocation: (useManualLocation) => set({ useManualLocation }),
      setManualLocation: (manualLocation) => set({ manualLocation }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)
