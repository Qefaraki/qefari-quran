import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Audio, AudioPlayer } from 'expo-audio'
import * as FileSystem from 'expo-file-system'
import { mmkvStorage } from '../lib/mmkv'
import { Asset } from 'expo-asset'

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
  downloadedReciters: string[]
  sleepTimerMinutes: number | null
  sleepTimerEndTime: Date | null
  player: AudioPlayer | null

  play: (reciter: Reciter) => Promise<void>
  pause: () => Promise<void>
  stop: () => Promise<void>
  seekToRandom: () => Promise<void>
  setDownloadProgress: (reciterId: string, progress: number) => void
  downloadReciter: (reciterId: string) => Promise<void>
  isReciterAvailable: (reciterId: string) => boolean
  getAudioPath: (reciter: Reciter) => string
  setSleepTimer: (minutes: number | null) => void
  checkSleepTimer: () => void
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

// Download URLs for downloadable reciters (placeholder - would be actual URLs)
const DOWNLOAD_URLS: Record<string, string> = {
  sudais: 'https://example.com/reciters/sudais.mp3',
  shuraim: 'https://example.com/reciters/shuraim.mp3',
  ghamdi: 'https://example.com/reciters/ghamdi.mp3',
  minshawi: 'https://example.com/reciters/minshawi.mp3',
  husary: 'https://example.com/reciters/husary.mp3',
}

let sleepTimerInterval: NodeJS.Timeout | null = null

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentReciter: null,
      reciters: defaultReciters,
      downloadProgress: {},
      downloadedReciters: [],
      sleepTimerMinutes: null,
      sleepTimerEndTime: null,
      player: null,

      getAudioPath: (reciter) => {
        if (reciter.isBundled) {
          // For bundled assets, return the require path
          return Asset.fromModule(require(`../assets/audio/${reciter.fileName}`)).uri
        } else {
          // For downloaded files
          return `${FileSystem.documentDirectory}audio/${reciter.fileName}`
        }
      },

      isReciterAvailable: (reciterId) => {
        const { reciters, downloadedReciters } = get()
        const reciter = reciters.find((r) => r.id === reciterId)
        if (!reciter) return false
        return reciter.isBundled || downloadedReciters.includes(reciterId)
      },

      play: async (reciter) => {
        const state = get()

        try {
          // If already playing this reciter, just resume
          if (state.currentReciter?.id === reciter.id && state.player) {
            await state.player.play()
            set({ isPlaying: true })
            return
          }

          // Stop current player if exists
          if (state.player) {
            await state.player.release()
          }

          // Get audio path
          let audioPath: string
          if (reciter.isBundled) {
            const asset = Asset.fromModule(require(`../assets/audio/${reciter.fileName}`))
            await asset.downloadAsync()
            audioPath = asset.localUri || asset.uri
          } else {
            audioPath = `${FileSystem.documentDirectory}audio/${reciter.fileName}`
          }

          // Create new player
          const player = await Audio.createPlayer({
            source: { uri: audioPath },
            shouldPlay: false,
          })

          // Get duration and seek to random position (10-90%)
          const status = await player.getStatus()
          if (status.duration) {
            const minPos = status.duration * 0.1
            const maxPos = status.duration * 0.9
            const randomPos = minPos + Math.random() * (maxPos - minPos)
            await player.setPositionAsync(randomPos)
          }

          // Start playing
          await player.play()

          set({
            isPlaying: true,
            currentReciter: reciter,
            player,
          })
        } catch (error) {
          console.error('Error playing audio:', error)
          set({ isPlaying: false, currentReciter: null })
        }
      },

      pause: async () => {
        const { player } = get()
        if (player) {
          await player.pause()
          set({ isPlaying: false })
        }
      },

      stop: async () => {
        const { player } = get()
        if (player) {
          await player.stop()
          await player.release()
          set({ isPlaying: false, currentReciter: null, player: null })
        }
      },

      seekToRandom: async () => {
        const { player } = get()
        if (player) {
          const status = await player.getStatus()
          if (status.duration) {
            const minPos = status.duration * 0.1
            const maxPos = status.duration * 0.9
            const randomPos = minPos + Math.random() * (maxPos - minPos)
            await player.setPositionAsync(randomPos)
          }
        }
      },

      setDownloadProgress: (reciterId, progress) => {
        set((state) => ({
          downloadProgress: { ...state.downloadProgress, [reciterId]: progress },
        }))
      },

      downloadReciter: async (reciterId) => {
        const { reciters, setDownloadProgress } = get()
        const reciter = reciters.find((r) => r.id === reciterId)
        if (!reciter || reciter.isBundled) return

        const downloadUrl = DOWNLOAD_URLS[reciterId]
        if (!downloadUrl) {
          console.error('Download URL not found for reciter:', reciterId)
          return
        }

        try {
          // Ensure audio directory exists
          const audioDir = `${FileSystem.documentDirectory}audio/`
          const dirInfo = await FileSystem.getInfoAsync(audioDir)
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true })
          }

          const fileUri = `${audioDir}${reciter.fileName}`

          // Download with progress tracking
          const downloadResumable = FileSystem.createDownloadResumable(
            downloadUrl,
            fileUri,
            {},
            (downloadProgress) => {
              const progress =
                downloadProgress.totalBytesWritten /
                downloadProgress.totalBytesExpectedToWrite
              setDownloadProgress(reciterId, Math.round(progress * 100))
            }
          )

          const result = await downloadResumable.downloadAsync()

          if (result) {
            set((state) => ({
              downloadedReciters: [...state.downloadedReciters, reciterId],
              reciters: state.reciters.map((r) =>
                r.id === reciterId ? { ...r, isDownloaded: true } : r
              ),
              downloadProgress: { ...state.downloadProgress, [reciterId]: 100 },
            }))
          }
        } catch (error) {
          console.error('Error downloading reciter:', error)
          set((state) => ({
            downloadProgress: { ...state.downloadProgress, [reciterId]: 0 },
          }))
        }
      },

      setSleepTimer: (minutes) => {
        if (sleepTimerInterval) {
          clearInterval(sleepTimerInterval)
          sleepTimerInterval = null
        }

        if (minutes === null) {
          set({ sleepTimerMinutes: null, sleepTimerEndTime: null })
        } else {
          const endTime = new Date(Date.now() + minutes * 60 * 1000)
          set({ sleepTimerMinutes: minutes, sleepTimerEndTime: endTime })

          // Start checking timer
          sleepTimerInterval = setInterval(() => {
            get().checkSleepTimer()
          }, 1000)
        }
      },

      checkSleepTimer: () => {
        const { sleepTimerEndTime, stop, setSleepTimer } = get()
        if (sleepTimerEndTime && new Date() >= sleepTimerEndTime) {
          stop()
          setSleepTimer(null)
        }
      },
    }),
    {
      name: 'audio-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        downloadedReciters: state.downloadedReciters,
      }),
    }
  )
)
