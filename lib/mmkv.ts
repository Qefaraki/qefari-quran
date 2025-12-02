import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

// Zustand persist storage adapter
export const mmkvStorage = {
  getItem: (name: string): string | null => {
    return storage.getString(name) ?? null
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value)
  },
  removeItem: (name: string): void => {
    storage.delete(name)
  },
}
