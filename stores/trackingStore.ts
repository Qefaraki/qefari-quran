import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mmkvStorage } from '../lib/mmkv'

export interface PrayerRecord {
  date: string
  tahajjud1: boolean
  tahajjud2: boolean
  tahajjud3: boolean
  tahajjud4: boolean
  witr: boolean
}

export interface TrackingStats {
  currentStreak: number
  bestStreak: number
  totalNights: number
  perfectNights: number
  totalPoints: number
  averagePoints: number
}

interface TrackingState {
  records: Record<string, PrayerRecord>

  getRecord: (date: string) => PrayerRecord
  togglePrayer: (date: string, prayer: keyof Omit<PrayerRecord, 'date'>) => void
  getStats: () => TrackingStats
  getPoints: (record: PrayerRecord) => number
}

const createEmptyRecord = (date: string): PrayerRecord => ({
  date,
  tahajjud1: false,
  tahajjud2: false,
  tahajjud3: false,
  tahajjud4: false,
  witr: false,
})

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set, get) => ({
      records: {},

      getRecord: (date) => {
        const { records } = get()
        return records[date] || createEmptyRecord(date)
      },

      togglePrayer: (date, prayer) => {
        set((state) => {
          const existing = state.records[date] || createEmptyRecord(date)
          return {
            records: {
              ...state.records,
              [date]: {
                ...existing,
                [prayer]: !existing[prayer],
              },
            },
          }
        })
      },

      getPoints: (record) => {
        let points = 0
        if (record.tahajjud1) points += 2
        if (record.tahajjud2) points += 2
        if (record.tahajjud3) points += 2
        if (record.tahajjud4) points += 2
        if (record.witr) points += 1
        return points
      },

      getStats: () => {
        const { records, getPoints } = get()
        const dates = Object.keys(records).sort().reverse()

        let currentStreak = 0
        let bestStreak = 0
        let tempStreak = 0
        let totalNights = 0
        let perfectNights = 0
        let totalPoints = 0

        for (const date of dates) {
          const record = records[date]
          const points = getPoints(record)

          if (points > 0) {
            totalNights++
            totalPoints += points
            tempStreak++

            if (points === 9) perfectNights++
            if (tempStreak > bestStreak) bestStreak = tempStreak
          } else {
            if (currentStreak === 0) currentStreak = tempStreak
            tempStreak = 0
          }
        }

        if (currentStreak === 0) currentStreak = tempStreak

        return {
          currentStreak,
          bestStreak,
          totalNights,
          perfectNights,
          totalPoints,
          averagePoints: totalNights > 0 ? totalPoints / totalNights : 0,
        }
      },
    }),
    {
      name: 'tracking-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)
