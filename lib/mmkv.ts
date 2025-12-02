import { MMKV as MMKVClass } from 'react-native-mmkv'

// @ts-ignore - MMKV is both a type and a class
export const storage = new MMKVClass()

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
