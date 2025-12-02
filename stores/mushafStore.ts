import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mmkvStorage } from '../lib/mmkv'

export interface Bookmark {
  id: string
  globalIndex: number
  surahNumber: number
  ayahNumber: number
  colorIndex: number
  createdAt: string
}

interface MushafState {
  currentPosition: number
  bookmarks: Bookmark[]
  fontSize: number
  lineSpacing: number

  updatePosition: (index: number) => void
  addBookmark: (surahNumber: number, ayahNumber: number, globalIndex: number) => void
  removeBookmark: (id: string) => void
  setFontSize: (size: number) => void
  setLineSpacing: (spacing: number) => void
  getNextBookmarkColor: () => number
}

const BOOKMARK_COLORS = 8

export const useMushafStore = create<MushafState>()(
  persist(
    (set, get) => ({
      currentPosition: 1,
      bookmarks: [],
      fontSize: 28,
      lineSpacing: 16,

      updatePosition: (index) => set({ currentPosition: index }),

      addBookmark: (surahNumber, ayahNumber, globalIndex) => {
        const colorIndex = get().getNextBookmarkColor()
        const bookmark: Bookmark = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          globalIndex,
          surahNumber,
          ayahNumber,
          colorIndex,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ bookmarks: [...state.bookmarks, bookmark] }))
      },

      removeBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }))
      },

      setFontSize: (fontSize) => set({ fontSize }),
      setLineSpacing: (lineSpacing) => set({ lineSpacing }),

      getNextBookmarkColor: () => {
        const { bookmarks } = get()
        return bookmarks.length % BOOKMARK_COLORS
      },
    }),
    {
      name: 'mushaf-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)
