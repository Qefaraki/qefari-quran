import { create } from 'zustand'

export interface Reciter {
  id: string
  name: string
  nameArabic: string
  fileName: string
  fileSize: number
  isDownloaded: boolean
  isBundled: boolean
}

interface AudioState {
  isPlaying: boolean
  currentReciter: Reciter | null
  reciters: Reciter[]
  downloadProgress: Record<string, number>
  sleepTimerMinutes: number | null
  sleepTimerEndTime: Date | null

  play: (reciter: Reciter) => Promise<void>
  pause: () => Promise<void>
  stop: () => Promise<void>
  setDownloadProgress: (reciterId: string, progress: number) => void
  markDownloaded: (reciterId: string) => void
  setSleepTimer: (minutes: number | null) => void
}

const defaultReciters: Reciter[] = [
  // Bundled reciters (already in assets/audio)
  { id: 'maher', name: 'Maher Almuaiqly', nameArabic: 'ماهر المعيقلي', fileName: 'maher.mp3', fileSize: 8565567, isDownloaded: true, isBundled: true },
  { id: 'ali_jaber', name: 'Ali Jaber', nameArabic: 'علي جابر', fileName: 'ali_jaber.mp3', fileSize: 29919829, isDownloaded: true, isBundled: true },
  { id: 'ahmad_taleb', name: 'Ahmad Al-Taleb', nameArabic: 'أحمد الطالب', fileName: 'ahmad_taleb.mp3', fileSize: 9837287, isDownloaded: true, isBundled: true },
  { id: 'aidan', name: 'Aidan', nameArabic: 'عيدان', fileName: 'aidan.mp3', fileSize: 35056683, isDownloaded: true, isBundled: true },
  { id: 'humaidi', name: 'Al-Humaidi', nameArabic: 'الحميدي', fileName: 'humaidi.mp3', fileSize: 7382678, isDownloaded: true, isBundled: true },
  { id: 'najdiyyah', name: 'Najdiyyah', nameArabic: 'نجدية', fileName: 'najdiyyah.mp3', fileSize: 19018007, isDownloaded: true, isBundled: true },
  { id: 'qaraawi', name: 'Al-Qaraawi', nameArabic: 'القرعاوي', fileName: 'qaraawi.mp3', fileSize: 10485307, isDownloaded: true, isBundled: true },
  { id: 'souilass', name: 'Souilass', nameArabic: 'سويلاس', fileName: 'souilass.mp3', fileSize: 16263096, isDownloaded: true, isBundled: true },
  // Downloadable reciters
  { id: 'sudais', name: 'Abdulrahman Alsudais', nameArabic: 'عبدالرحمن السديس', fileName: 'sudais.mp3', fileSize: 110000000, isDownloaded: false, isBundled: false },
  { id: 'shuraim', name: 'Saud Alshuraim', nameArabic: 'سعود الشريم', fileName: 'shuraim.mp3', fileSize: 105000000, isDownloaded: false, isBundled: false },
  { id: 'ghamdi', name: 'Saad Alghamdi', nameArabic: 'سعد الغامدي', fileName: 'ghamdi.mp3', fileSize: 95000000, isDownloaded: false, isBundled: false },
  { id: 'minshawi', name: 'Mohamed Siddiq El-Minshawi', nameArabic: 'محمد صديق المنشاوي', fileName: 'minshawi.mp3', fileSize: 120000000, isDownloaded: false, isBundled: false },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary', nameArabic: 'محمود خليل الحصري', fileName: 'husary.mp3', fileSize: 115000000, isDownloaded: false, isBundled: false },
]

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  currentReciter: null,
  reciters: defaultReciters,
  downloadProgress: {},
  sleepTimerMinutes: null,
  sleepTimerEndTime: null,

  play: async (reciter) => {
    // Audio implementation to be added with expo-audio
    set({ isPlaying: true, currentReciter: reciter })
  },

  pause: async () => {
    set({ isPlaying: false })
  },

  stop: async () => {
    set({ isPlaying: false, currentReciter: null })
  },

  setDownloadProgress: (reciterId, progress) => {
    set((state) => ({
      downloadProgress: { ...state.downloadProgress, [reciterId]: progress },
    }))
  },

  markDownloaded: (reciterId) => {
    set((state) => ({
      reciters: state.reciters.map((r) =>
        r.id === reciterId ? { ...r, isDownloaded: true } : r
      ),
    }))
  },

  setSleepTimer: (minutes) => {
    if (minutes === null) {
      set({ sleepTimerMinutes: null, sleepTimerEndTime: null })
    } else {
      const endTime = new Date(Date.now() + minutes * 60 * 1000)
      set({ sleepTimerMinutes: minutes, sleepTimerEndTime: endTime })
    }
  },
}))
