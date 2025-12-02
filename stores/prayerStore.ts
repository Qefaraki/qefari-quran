import { create } from 'zustand'
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan'
import { formatInTimeZone } from 'date-fns-tz'
import { useSettingsStore } from './settingsStore'

export interface PrayerTime {
  name: string
  nameArabic: string
  time: string
  date: Date
  isPast: boolean
  isNext: boolean
}

interface PrayerState {
  times: PrayerTime[]
  city: string
  date: Date
  isLoading: boolean
  error: string | null
  timezone: string

  loadPrayerTimes: (lat: number, lon: number, city: string) => void
  refreshDisplayState: () => void
}

const methodMap: Record<string, () => CalculationMethod> = {
  ummAlQura: () => CalculationMethod.UmmAlQura(),
  muslimWorldLeague: () => CalculationMethod.MuslimWorldLeague(),
  isna: () => CalculationMethod.NorthAmerica(),
  karachi: () => CalculationMethod.Karachi(),
  singapore: () => CalculationMethod.Singapore(),
  egyptian: () => CalculationMethod.Egyptian(),
  turkey: () => CalculationMethod.Turkey(),
  kuwait: () => CalculationMethod.Kuwait(),
  qatar: () => CalculationMethod.Qatar(),
}

function getTimezone(lat: number, lon: number): string {
  // Middle East
  if (lat >= 16 && lat <= 32 && lon >= 34 && lon <= 56) {
    if (lon >= 39) return 'Asia/Riyadh'
    if (lon >= 35 && lon < 39) return 'Asia/Jerusalem'
    return 'Africa/Cairo'
  }
  // Turkey
  if (lat >= 36 && lat <= 42 && lon >= 26 && lon <= 45) return 'Europe/Istanbul'
  // South Asia
  if (lat >= 5 && lat <= 37 && lon >= 60 && lon <= 97) {
    if (lon >= 88) return 'Asia/Dhaka'
    if (lon >= 68) return 'Asia/Karachi'
    return 'Asia/Kolkata'
  }
  // Southeast Asia
  if (lat >= -10 && lat <= 20 && lon >= 95 && lon <= 141) {
    return lon >= 115 ? 'Asia/Jakarta' : 'Asia/Singapore'
  }
  // Fallback
  const hoursOffset = Math.round(lon / 15)
  return `Etc/GMT${hoursOffset >= 0 ? '+' : ''}${-hoursOffset}`
}

export const usePrayerStore = create<PrayerState>((set, get) => ({
  times: [],
  city: '',
  date: new Date(),
  isLoading: false,
  error: null,
  timezone: 'UTC',

  loadPrayerTimes: (lat, lon, city) => {
    set({ isLoading: true })

    const { calculationMethod } = useSettingsStore.getState()
    const now = new Date()
    const timezone = getTimezone(lat, lon)

    try {
      const coordinates = new Coordinates(lat, lon)
      const params = methodMap[calculationMethod]()
      const prayerTimes = new PrayerTimes(coordinates, now, params)

      const format = (d: Date) => formatInTimeZone(d, timezone, 'HH:mm')

      const prayers: PrayerTime[] = [
        { name: 'Fajr', nameArabic: 'الفجر', time: format(prayerTimes.fajr), date: prayerTimes.fajr, isPast: false, isNext: false },
        { name: 'Sunrise', nameArabic: 'الشروق', time: format(prayerTimes.sunrise), date: prayerTimes.sunrise, isPast: false, isNext: false },
        { name: 'Dhuhr', nameArabic: 'الظهر', time: format(prayerTimes.dhuhr), date: prayerTimes.dhuhr, isPast: false, isNext: false },
        { name: 'Asr', nameArabic: 'العصر', time: format(prayerTimes.asr), date: prayerTimes.asr, isPast: false, isNext: false },
        { name: 'Maghrib', nameArabic: 'المغرب', time: format(prayerTimes.maghrib), date: prayerTimes.maghrib, isPast: false, isNext: false },
        { name: 'Isha', nameArabic: 'العشاء', time: format(prayerTimes.isha), date: prayerTimes.isha, isPast: false, isNext: false },
      ]

      set({ times: prayers, city, date: now, timezone, isLoading: false })
      get().refreshDisplayState()
    } catch (error) {
      set({ error: 'Failed to calculate prayer times', isLoading: false })
    }
  },

  refreshDisplayState: () => {
    const { times } = get()
    const now = new Date()

    let foundNext = false
    const updated = times.map((prayer) => {
      const isPast = prayer.date < now
      const isNext = !isPast && !foundNext
      if (isNext) foundNext = true
      return { ...prayer, isPast, isNext }
    })

    set({ times: updated })
  },
}))
