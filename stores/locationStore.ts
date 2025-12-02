import { create } from 'zustand'
import * as Location from 'expo-location'

interface LocationState {
  location: Location.LocationObject | null
  heading: number
  city: string | null
  permissionStatus: Location.PermissionStatus | null
  isLoading: boolean
  error: string | null

  requestPermission: () => Promise<boolean>
  getCurrentLocation: () => Promise<void>
  startHeadingUpdates: () => Promise<() => void>
  fetchCityName: (lat: number, lon: number) => Promise<void>
  setHeading: (heading: number) => void
}

export const useLocationStore = create<LocationState>((set, get) => ({
  location: null,
  heading: 0,
  city: null,
  permissionStatus: null,
  isLoading: false,
  error: null,

  requestPermission: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    set({ permissionStatus: status })
    return status === 'granted'
  },

  getCurrentLocation: async () => {
    set({ isLoading: true, error: null })
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      set({ location, isLoading: false })

      const { fetchCityName } = get()
      await fetchCityName(location.coords.latitude, location.coords.longitude)
    } catch (error) {
      set({ error: 'Failed to get location', isLoading: false })
    }
  },

  startHeadingUpdates: async () => {
    const subscription = await Location.watchHeadingAsync((heading) => {
      set({ heading: heading.magHeading })
    })
    return () => subscription.remove()
  },

  fetchCityName: async (lat: number, lon: number) => {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      const response = await fetch(url)
      const data = await response.json()
      const city = data.city || data.locality || data.principalSubdivision || 'Unknown'
      set({ city })
    } catch {
      set({ city: 'Unknown' })
    }
  },

  setHeading: (heading) => set({ heading }),
}))
