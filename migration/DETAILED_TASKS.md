# Detailed Task Breakdown - Qefari Quran Migration

This document contains granular, executable tasks for each of the 5 parallel agents.

---

# AGENT 1: Project Foundation & Infrastructure

**Objective**: Set up Expo project, GitHub repo, core configuration, and storage infrastructure.
**Branch**: `main`
**Must complete before**: Agents 2-5

---

## Task 1.1: Create Project & GitHub Repository

```bash
cd ~/Desktop/qefari-quran

# Initialize Expo project with TypeScript
npx create-expo-app@latest . --template blank-typescript

# Initialize git
git init

# Create GitHub repo and push
gh repo create qefari-quran --public --source=. --remote=origin --push
```

**Verification**: `gh repo view qefari-quran` shows repository exists

---

## Task 1.2: Install Core Dependencies

```bash
# Development client (REQUIRED - not Expo Go)
npx expo install expo-dev-client

# Storage (MMKV, not AsyncStorage)
# CRITICAL: MMKV 4.0.1+ required for SDK 54 compatibility
# CRITICAL: MMKV requires react-native-nitro-modules as peer dependency
npm install react-native-mmkv@^4.0.1 react-native-nitro-modules
npm install zustand

# CRITICAL: After installing MMKV, you MUST run prebuild
# MMKV does NOT work in Expo Go - it requires native modules
npx expo prebuild

# Navigation
npx expo install expo-router expo-linking expo-constants expo-status-bar

# Location & Sensors
npx expo install expo-location expo-haptics

# Fonts
npx expo install expo-font expo-splash-screen

# Utilities
npm install date-fns date-fns-tz

# Prayer calculation
npm install adhan

# Large list rendering
npm install @legendapp/list

# Audio (expo-audio, NOT expo-av which is deprecated)
npx expo install expo-audio

# Animations
npx expo install react-native-reanimated

# File system for audio downloads
npx expo install expo-file-system
```

**Verification**: `npm ls` shows all packages installed

---

## Task 1.3: Configure app.json

Create/replace `app.json`:

**SDK 54 Notes**:
- No `statusBar` field (removed in SDK 54)
- Icons must be perfectly square
- Edge-to-edge Android is automatic

```json
{
  "expo": {
    "name": "Qefari Quran",
    "slug": "qefari-quran",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "qefari",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A1A1A"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.qefari.quran",
      "infoPlist": {
        "UIBackgroundModes": ["audio", "location"],
        "NSLocationWhenInUseUsageDescription": "Required to calculate prayer times and Qibla direction for your location."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1A1A1A"
      },
      "package": "com.qefari.quran",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "WAKE_LOCK",
        "VIBRATE",
        "HIGH_SAMPLING_RATE_SENSORS"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-font",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Qefari to use your location for prayer times and Qibla direction."
        }
      ]
    ]
  }
}
```

---

## Task 1.4: Configure TypeScript

Create/replace `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["components/*"],
      "@stores/*": ["stores/*"],
      "@services/*": ["services/*"],
      "@hooks/*": ["hooks/*"],
      "@utils/*": ["utils/*"],
      "@theme/*": ["theme/*"],
      "@data/*": ["data/*"],
      "@lib/*": ["lib/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

---

## Task 1.5: Create Directory Structure

```bash
mkdir -p app/\(tabs\)
mkdir -p components/{prayer,qibla,mushaf,tracking,radio,settings,ui}
mkdir -p stores
mkdir -p services
mkdir -p hooks
mkdir -p theme
mkdir -p data
mkdir -p lib
mkdir -p utils
mkdir -p assets/{fonts,images}
```

---

## Task 1.6: Create MMKV Storage Setup

Create `lib/mmkv.ts`:

```typescript
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
```

---

## Task 1.7: Create Root Layout

Create `app/_layout.tsx`:

**SDK 54**: Root layout includes settings gear icon in header + settings modal route.

```typescript
import { Stack, router } from 'expo-router'
import { useEffect } from 'react'
import { useFonts } from 'expo-font'
import { Pressable } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { Ionicons } from '@expo/vector-icons'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'KFGQPCHAFSUthmanicScript': require('../assets/fonts/KFGQPCHAFSUthmanicScript.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/settings')}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="settings-outline" size={24} color="#D4AF37" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'modal',
          headerTitle: 'Settings',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#FFFFFF',
        }}
      />
    </Stack>
  )
}
```

---

## Task 1.8: Create Native Tab Layout

Create `app/(tabs)/_layout.tsx`:

**SDK 54 Native Tabs**:
- Uses `expo-router/unstable-native-tabs` for platform-native tab bars
- 5 tabs only (Settings is in header, not a tab)
- Android limited to max 5 tabs in native tabs
- iOS uses SF Symbols, Android uses drawable resources

```typescript
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs'

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Prayer</Label>
        <Icon
          sf={{ default: 'clock', selected: 'clock.fill' }}
          drawable="ic_prayer"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="qibla">
        <Label>Qibla</Label>
        <Icon
          sf={{ default: 'location.north', selected: 'location.north.fill' }}
          drawable="ic_qibla"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mushaf">
        <Label>Quran</Label>
        <Icon
          sf={{ default: 'book', selected: 'book.fill' }}
          drawable="ic_mushaf"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tracking">
        <Label>Qiyam</Label>
        <Icon
          sf={{ default: 'moon.stars', selected: 'moon.stars.fill' }}
          drawable="ic_tracking"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="radio">
        <Label>Radio</Label>
        <Icon
          sf={{ default: 'radio', selected: 'radio.fill' }}
          drawable="ic_radio"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
```

**Note**: Settings tab is NOT included here - it's accessed via the gear icon in the header (see Task 1.7).

---

## Task 1.9: Create Placeholder Screens

Create placeholder for each tab screen:

**`app/(tabs)/index.tsx`**:
```typescript
import { View, Text, StyleSheet } from 'react-native'

export default function PrayerTimesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Prayer Times</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFFFFF', fontSize: 24 },
})
```

**`app/(tabs)/qibla.tsx`**:
```typescript
import { View, Text, StyleSheet } from 'react-native'

export default function QiblaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Qibla Compass</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFFFFF', fontSize: 24 },
})
```

**`app/(tabs)/mushaf.tsx`**:
```typescript
import { View, Text, StyleSheet } from 'react-native'

export default function MushafScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Quran</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFFFFF', fontSize: 24 },
})
```

**`app/(tabs)/tracking.tsx`**:
```typescript
import { View, Text, StyleSheet } from 'react-native'

export default function TrackingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Night Prayer Tracking</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFFFFF', fontSize: 24 },
})
```

**`app/(tabs)/radio.tsx`**:
```typescript
import { View, Text, StyleSheet } from 'react-native'

export default function RadioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Quran Radio</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFFFFF', fontSize: 24 },
})
```

**`app/settings.tsx`** (NOT in tabs - modal screen):
```typescript
import { View, Text, StyleSheet, ScrollView } from 'react-native'

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Settings</Text>
        <Text style={styles.subtitle}>Theme, language, notifications, and more</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  text: { color: '#FFFFFF', fontSize: 24 },
  subtitle: { color: '#888888', fontSize: 14, marginTop: 8 },
})
```

**Note**: Settings is at `app/settings.tsx` (root level), NOT `app/(tabs)/settings.tsx`. It opens as a modal via the gear icon in the header.

---

## Task 1.10: Copy Assets from Swift Project

```bash
# Copy Quran data
cp ~/Desktop/qiyam-swift/QefariQibla/Resources/quran.json ~/Desktop/qefari-quran/data/

# Copy Arabic font (keep original filename to avoid confusion)
cp ~/Desktop/qiyam-swift/QefariQibla/Resources/Fonts/KFGQPCHAFSUthmanicScript.ttf ~/Desktop/qefari-quran/assets/fonts/KFGQPCHAFSUthmanicScript.ttf

# Copy bundled audio files (8 reciters)
mkdir -p ~/Desktop/qefari-quran/assets/audio
cp ~/Desktop/qiyam-swift/QefariQibla/Resources/Audio/*.mp3 ~/Desktop/qefari-quran/assets/audio/
```

---

## Task 1.11: Initial Commit

```bash
git add .
git commit -m "Initial project setup with Expo Router, MMKV, and tab navigation"
git push origin main
```

---

## Agent 1 Completion Checklist

- [ ] GitHub repo `qefari-quran` exists and is accessible
- [ ] All dependencies installed without errors
- [ ] `npx expo prebuild` completed successfully (required for MMKV)
- [ ] Directory structure created
- [ ] MMKV storage configured
- [ ] Native Tabs with 5 tabs working (Prayer, Qibla, Mushaf, Tracking, Radio) + Settings modal in header
- [ ] Arabic font copied to assets
- [ ] quran.json copied to data
- [ ] Bundled audio files copied to assets/audio
- [ ] App runs with `npx expo run:ios` (NOT Expo Go)

---

# AGENT 2: State Management & Data Layer

**Objective**: Create all Zustand stores, data loaders, and persistence layer.
**Branch**: `feature/stores`
**Depends on**: Agent 1

---

## Task 2.1: Create Settings Store

Create `stores/settingsStore.ts`:

```typescript
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
```

---

## Task 2.2: Create Location Store

Create `stores/locationStore.ts`:

```typescript
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
```

---

## Task 2.3: Create Prayer Store

Create `stores/prayerStore.ts`:

```typescript
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
```

---

## Task 2.4: Create Mushaf Store

Create `stores/mushafStore.ts`:

```typescript
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
```

---

## Task 2.5: Create Tracking Store

Create `stores/trackingStore.ts`:

```typescript
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
```

---

## Task 2.6: Create Audio Store

Create `stores/audioStore.ts`:

```typescript
import { create } from 'zustand'

export interface Reciter {
  id: string
  name: string
  nameArabic: string
  fileName: string
  fileSize: number
  isDownloaded: boolean
}

interface AudioState {
  isPlaying: boolean
  currentReciter: Reciter | null
  reciters: Reciter[]
  downloadProgress: Record<string, number>

  play: (reciter: Reciter) => Promise<void>
  pause: () => Promise<void>
  stop: () => Promise<void>
  setDownloadProgress: (reciterId: string, progress: number) => void
  markDownloaded: (reciterId: string) => void
}

const defaultReciters: Reciter[] = [
  { id: 'maher', name: 'Maher Almuaiqly', nameArabic: 'ماهر المعيقلي', fileName: 'maher.mp3', fileSize: 126000000, isDownloaded: false },
  { id: 'ali_jaber', name: 'Ali Jaber', nameArabic: 'علي جابر', fileName: 'ali_jaber.mp3', fileSize: 98000000, isDownloaded: false },
  { id: 'sudais', name: 'Abdulrahman Alsudais', nameArabic: 'عبدالرحمن السديس', fileName: 'sudais.mp3', fileSize: 110000000, isDownloaded: false },
  { id: 'shuraim', name: 'Saud Alshuraim', nameArabic: 'سعود الشريم', fileName: 'shuraim.mp3', fileSize: 105000000, isDownloaded: false },
  { id: 'ghamdi', name: 'Saad Alghamdi', nameArabic: 'سعد الغامدي', fileName: 'ghamdi.mp3', fileSize: 95000000, isDownloaded: false },
]

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  currentReciter: null,
  reciters: defaultReciters,
  downloadProgress: {},

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
}))
```

---

## Task 2.7: Create Quran Data Loader (OPTIMIZED)

Create `data/quranLoader.ts`:

```typescript
import quranData from './quran.json'

// ============================================
// INTERFACES
// ============================================

export interface Ayah {
  id: string              // "1:1" format
  globalIndex: number
  surahNumber: number
  ayahNumber: number
  textArabic: string      // The Arabic text
  page: number
  juz: number
}

export interface Surah {
  id: number              // 1-114
  nameArabic: string      // "الفَاتِحة"
  nameEnglish: string     // "Al-Fātiḥah"
  ayahCount: number
  revelationType: 'Makkah' | 'Madinah'
  startAyahIndex: number
}

export interface ListItem {
  type: 'surah' | 'ayah'
  surah?: Surah
  ayah?: Ayah
}

export interface QuranData {
  ayahs: Ayah[]
  surahs: Surah[]
  ayahByIndex: Map<number, Ayah>
  surahById: Map<number, Surah>
}

// ============================================
// CACHED DATA (Computed once, cached forever)
// ============================================

let cachedData: QuranData | null = null
let cachedListItems: ListItem[] | null = null
let globalIndexToListIndex: Map<number, number> | null = null
let surahIdToListIndex: Map<number, number> | null = null

// ============================================
// CORE DATA FUNCTIONS
// ============================================

export function getQuranData(): QuranData {
  if (cachedData) return cachedData

  const ayahByIndex = new Map<number, Ayah>()
  const surahById = new Map<number, Surah>()

  for (const ayah of (quranData as any).ayahs) {
    ayahByIndex.set(ayah.globalIndex, ayah)
  }

  for (const surah of (quranData as any).surahs) {
    surahById.set(surah.id, surah)
  }

  cachedData = {
    ayahs: (quranData as any).ayahs,
    surahs: (quranData as any).surahs,
    ayahByIndex,
    surahById,
  }

  return cachedData
}

export function getAyah(globalIndex: number): Ayah | undefined {
  return getQuranData().ayahByIndex.get(globalIndex)
}

export function getSurah(surahId: number): Surah | undefined {
  return getQuranData().surahById.get(surahId)
}

export function getAyahsForSurah(surahNumber: number): Ayah[] {
  const data = getQuranData()
  return data.ayahs.filter((a) => a.surahNumber === surahNumber)
}

// ============================================
// OPTIMIZED LIST FUNCTIONS (O(1) lookups)
// ============================================

/**
 * Returns memoized list items for LegendList.
 * Combines surahs and ayahs into a single flat list.
 * Only computed once, then cached forever.
 */
export function getListItems(): ListItem[] {
  if (cachedListItems) return cachedListItems

  cachedListItems = []
  globalIndexToListIndex = new Map()
  surahIdToListIndex = new Map()

  let currentSurahNumber = 0
  const { ayahs, surahById } = getQuranData()

  for (const ayah of ayahs) {
    // Insert surah header when surah changes
    if (ayah.surahNumber !== currentSurahNumber) {
      currentSurahNumber = ayah.surahNumber
      const surah = surahById.get(ayah.surahNumber)
      if (surah) {
        surahIdToListIndex.set(surah.id, cachedListItems.length)
        cachedListItems.push({ type: 'surah', surah })
      }
    }
    // Insert ayah
    globalIndexToListIndex.set(ayah.globalIndex, cachedListItems.length)
    cachedListItems.push({ type: 'ayah', ayah })
  }

  return cachedListItems
}

/**
 * O(1) lookup: Get list index for an ayah by globalIndex.
 * Used for bookmark navigation and position restoration.
 */
export function getListIndexForAyah(globalIndex: number): number {
  if (!globalIndexToListIndex) getListItems()
  return globalIndexToListIndex!.get(globalIndex) ?? -1
}

/**
 * O(1) lookup: Get list index for a surah by surahId.
 * Used for surah navigation.
 */
export function getListIndexForSurah(surahId: number): number {
  if (!surahIdToListIndex) getListItems()
  return surahIdToListIndex!.get(surahId) ?? -1
}

/**
 * Get first ayah globalIndex for a juz number.
 * Used for juz navigation.
 */
export function getFirstAyahOfJuz(juzNumber: number): number | undefined {
  const { ayahs } = getQuranData()
  const ayah = ayahs.find(a => a.juz === juzNumber)
  return ayah?.globalIndex
}
```

---

## Task 2.8: Create Store Index

Create `stores/index.ts`:

```typescript
export { useSettingsStore } from './settingsStore'
export { useLocationStore } from './locationStore'
export { usePrayerStore } from './prayerStore'
export { useMushafStore } from './mushafStore'
export { useTrackingStore } from './trackingStore'
export { useAudioStore } from './audioStore'
```

---

## Task 2.9: Commit Changes

```bash
git checkout -b feature/stores
git add .
git commit -m "Add Zustand stores with MMKV persistence and Quran data loader"
git push origin feature/stores
```

---

## Agent 2 Completion Checklist

- [ ] All 6 Zustand stores created
- [ ] MMKV persistence working for settings, mushaf, tracking
- [ ] Quran data loader with O(1) lookups
- [ ] TypeScript types exported
- [ ] No TypeScript errors

---

# AGENT 3: Prayer Times & Qibla Features

**Objective**: Implement prayer calculation, Qibla compass, and location services.
**Branch**: `feature/prayer-qibla`
**Depends on**: Agent 1, Agent 2 (stores)

---

## ⚠️ PREREQUISITE: Create UI Components First

Before implementing screens, run these GEMINI prompts from `GEMINI_COMPONENT_PROMPTS.md`:

| Prompt | Component | File Path |
|--------|-----------|-----------|
| Prompt 2 | PrayerTimeRow | `components/prayer/PrayerTimeRow.tsx` |
| Prompt 3 | NextPrayerCountdown | `components/prayer/NextPrayerCountdown.tsx` |
| Prompt 4 | CompassDial | `components/qibla/CompassDial.tsx` |
| Prompt 5 | QiblaArrow | `components/qibla/QiblaArrow.tsx` |

These components are imported by the screens but defined only in GEMINI prompts.

---

## Task 3.1: Create Qibla Calculation Service

Create `services/qiblaCalculation.ts`:

```typescript
const KAABA_LAT = 21.4225
const KAABA_LON = 39.8262

export function calculateQiblaDirection(latitude: number, longitude: number): number {
  const lat1 = toRadians(latitude)
  const lon1 = toRadians(longitude)
  const lat2 = toRadians(KAABA_LAT)
  const lon2 = toRadians(KAABA_LON)

  const dLon = lon2 - lon1

  const x = Math.sin(dLon)
  const y = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLon)

  let bearing = Math.atan2(x, y)
  bearing = toDegrees(bearing)
  bearing = (bearing + 360) % 360

  return bearing
}

export function getDirectionText(angleDifference: number): string {
  const normalized = ((angleDifference % 360) + 360) % 360
  const angle = normalized > 180 ? normalized - 360 : normalized

  if (Math.abs(angle) <= 5) return 'Facing Qibla'
  if (Math.abs(angle) <= 22.5) return angle > 0 ? 'Slightly Right' : 'Slightly Left'
  if (Math.abs(angle) <= 45) return angle > 0 ? 'Turn Right' : 'Turn Left'
  if (Math.abs(angle) <= 135) return angle > 0 ? 'To Your Right' : 'To Your Left'
  return 'Behind You'
}

export function isAligned(angleDifference: number): boolean {
  const normalized = ((angleDifference % 360) + 360) % 360
  const angle = normalized > 180 ? normalized - 360 : normalized
  return Math.abs(angle) <= 5
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}
```

---

## Task 3.2: Create Compass Heading Hook

Create `hooks/useCompassHeading.ts`:

```typescript
import { useState, useEffect } from 'react'
import * as Location from 'expo-location'

export function useCompassHeading() {
  const [heading, setHeading] = useState(0)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null

    async function start() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          setHasPermission(false)
          setError('Location permission denied')
          return
        }
        setHasPermission(true)

        subscription = await Location.watchHeadingAsync((data) => {
          setHeading(data.magHeading)
        })
      } catch (e) {
        setError('Failed to start compass')
      }
    }

    start()

    return () => {
      subscription?.remove()
    }
  }, [])

  return { heading, hasPermission, error }
}
```

---

## Task 3.3: Implement Prayer Times Screen

Replace `app/(tabs)/index.tsx`:

```typescript
import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { usePrayerStore } from '../../stores/prayerStore'
import { useLocationStore } from '../../stores/locationStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { PrayerTimeRow } from '../../components/prayer/PrayerTimeRow'
import { NextPrayerCountdown } from '../../components/prayer/NextPrayerCountdown'

export default function PrayerTimesScreen() {
  const { times, city, loadPrayerTimes, refreshDisplayState } = usePrayerStore()
  const { location, getCurrentLocation, requestPermission } = useLocationStore()
  const { useManualLocation, manualLocation } = useSettingsStore()

  useEffect(() => {
    async function init() {
      const granted = await requestPermission()
      if (granted && !useManualLocation) {
        await getCurrentLocation()
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (useManualLocation && manualLocation) {
      loadPrayerTimes(manualLocation.lat, manualLocation.lon, manualLocation.city)
    } else if (location) {
      const { latitude, longitude } = location.coords
      loadPrayerTimes(latitude, longitude, city || 'Unknown')
    }
  }, [location, useManualLocation, manualLocation])

  useEffect(() => {
    const timer = setInterval(() => {
      refreshDisplayState()
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const nextPrayer = times.find((t) => t.isNext)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.city}>{city || 'Loading...'}</Text>
        {nextPrayer && <NextPrayerCountdown prayer={nextPrayer} />}
      </View>

      <View style={styles.timesContainer}>
        {times.map((prayer) => (
          <PrayerTimeRow key={prayer.name} prayer={prayer} />
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  city: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timesContainer: {
    padding: 16,
  },
})
```

---

## Task 3.4: Implement Qibla Screen

Replace `app/(tabs)/qibla.tsx`:

```typescript
import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useCompassHeading } from '../../hooks/useCompassHeading'
import { useLocationStore } from '../../stores/locationStore'
import { calculateQiblaDirection, getDirectionText, isAligned } from '../../services/qiblaCalculation'
import * as Haptics from 'expo-haptics'
import { CompassDial } from '../../components/qibla/CompassDial'
import { QiblaArrow } from '../../components/qibla/QiblaArrow'

export default function QiblaScreen() {
  const { heading, hasPermission } = useCompassHeading()
  const { location, getCurrentLocation, requestPermission } = useLocationStore()
  const [qiblaDirection, setQiblaDirection] = useState(0)
  const [wasAligned, setWasAligned] = useState(false)

  useEffect(() => {
    async function init() {
      const granted = await requestPermission()
      if (granted) {
        await getCurrentLocation()
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (location) {
      const { latitude, longitude } = location.coords
      const direction = calculateQiblaDirection(latitude, longitude)
      setQiblaDirection(direction)
    }
  }, [location])

  const angleDifference = qiblaDirection - heading
  const aligned = isAligned(angleDifference)
  const directionText = getDirectionText(angleDifference)

  useEffect(() => {
    if (aligned && !wasAligned) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
    setWasAligned(aligned)
  }, [aligned])

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Location permission required</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, aligned && styles.alignedContainer]}>
      <Text style={styles.directionText}>{directionText}</Text>

      <View style={styles.compassContainer}>
        <CompassDial rotation={-heading} />
        <QiblaArrow rotation={qiblaDirection - heading} />
      </View>

      <Text style={styles.degreeText}>
        {Math.round(qiblaDirection)}° from North
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignedContainer: {
    backgroundColor: '#1B4332',
  },
  directionText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  compassContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  degreeText: {
    fontSize: 16,
    color: '#888888',
    marginTop: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
  },
})
```

---

## Task 3.5: Commit Changes

```bash
git checkout -b feature/prayer-qibla
git add .
git commit -m "Implement prayer times calculation and Qibla compass"
git push origin feature/prayer-qibla
```

---

## Agent 3 Completion Checklist

- [ ] Prayer times calculate correctly for test locations
- [ ] Qibla direction accurate (compare with physical compass)
- [ ] Compass heading updates smoothly
- [ ] Haptic feedback on Qibla alignment
- [ ] Next prayer countdown working

---

# AGENT 4: Mushaf (Quran Reader) - PERFORMANCE OPTIMIZED

**Objective**: Implement high-performance Quran reader with 60 FPS scrolling for 6,236 ayahs.
**Branch**: `feature/mushaf`
**Depends on**: Agent 1, Agent 2 (stores)

---

## ⚠️ PREREQUISITE: Create UI Components First

Before implementing screens, run these GEMINI prompts from `GEMINI_COMPONENT_PROMPTS.md`:

| Prompt | Component | File Path |
|--------|-----------|-----------|
| Prompt 8 | SurahListSheet | `components/mushaf/SurahListSheet.tsx` |
| Prompt 9 | BookmarksSheet | `components/mushaf/BookmarksSheet.tsx` |

**Note**: AyahView and SurahHeader are defined in Tasks 4.4 and 4.5 below (optimized versions).

---

## Task 4.1: Create Debounced Position Hook

Create `hooks/useDebouncedPosition.ts`:

```typescript
import { useRef, useCallback, useEffect } from 'react'
import { useMushafStore } from '../stores/mushafStore'

/**
 * Debounces position updates to reduce MMKV writes during scrolling.
 * Only saves position after user stops scrolling for `delay` ms.
 */
export function useDebouncedPosition(delay = 500) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPositionRef = useRef<number>(0)
  const { updatePosition } = useMushafStore()

  const debouncedUpdate = useCallback((globalIndex: number) => {
    // Skip if same position
    if (globalIndex === lastPositionRef.current) return
    lastPositionRef.current = globalIndex

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce write to storage
    timeoutRef.current = setTimeout(() => {
      updatePosition(globalIndex)
    }, delay)
  }, [updatePosition, delay])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedUpdate
}
```

---

## Task 4.2: Create Height Estimator Utility

Create `utils/ayahHeightEstimator.ts`:

```typescript
import { Ayah } from '../data/quranLoader'

const BASE_HEIGHT = 60
const LINE_HEIGHT = 50        // Matches Arabic font lineHeight
const PADDING = 32            // 16px top + 16px bottom
const SURAH_HEADER_HEIGHT = 120

/**
 * Estimates ayah height based on text length and font size.
 * More accurate than fixed estimatedItemSize for variable Arabic text.
 */
export function estimateAyahHeight(ayah: Ayah, fontSize: number = 28): number {
  const textLength = ayah.textArabic.length

  // Approximate characters per line based on screen width (~350px content)
  // Arabic characters are wider, so factor is 0.6
  const charsPerLine = Math.floor(350 / (fontSize * 0.6))
  const estimatedLines = Math.ceil(textLength / charsPerLine)

  // Calculate height: lines * lineHeight + padding
  const calculatedHeight = (estimatedLines * LINE_HEIGHT) + PADDING

  return Math.max(BASE_HEIGHT, calculatedHeight)
}

/**
 * Fixed height for surah headers (bismillah + title).
 */
export function estimateSurahHeaderHeight(): number {
  return SURAH_HEADER_HEIGHT
}
```

---

## Task 4.3: Implement Optimized Mushaf Screen

Replace `app/(tabs)/mushaf.tsx`:

```typescript
import { useRef, useEffect, useCallback, useState } from 'react'
import { View, StyleSheet, Pressable, Text } from 'react-native'
import { LegendList } from '@legendapp/list'
import { useMushafStore } from '../../stores/mushafStore'
import {
  getQuranData,
  getListItems,
  getListIndexForAyah,
  getListIndexForSurah,
  getAyah,
  ListItem,
} from '../../data/quranLoader'
import { AyahView } from '../../components/mushaf/AyahView'
import { SurahHeader } from '../../components/mushaf/SurahHeader'
import { SurahListSheet } from '../../components/mushaf/SurahListSheet'
import { BookmarksSheet } from '../../components/mushaf/BookmarksSheet'
import { useDebouncedPosition } from '../../hooks/useDebouncedPosition'
import { estimateAyahHeight, estimateSurahHeaderHeight } from '../../utils/ayahHeightEstimator'

export default function MushafScreen() {
  const { currentPosition, bookmarks, removeBookmark, fontSize } = useMushafStore()
  const listRef = useRef<any>(null)
  const [showSurahList, setShowSurahList] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)

  // OPTIMIZED: Debounced position saves (500ms delay)
  const debouncedUpdatePosition = useDebouncedPosition(500)

  // OPTIMIZED: Memoized list items (computed once, cached forever)
  const listItems = getListItems()
  const quranData = getQuranData()

  // OPTIMIZED: O(1) navigation using pre-computed index maps
  const navigateToSurah = useCallback((surahId: number) => {
    const index = getListIndexForSurah(surahId)
    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, animated: true })
    }
    setShowSurahList(false)
  }, [])

  const navigateToBookmark = useCallback((globalIndex: number) => {
    const index = getListIndexForAyah(globalIndex)
    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, animated: true })
    }
    setShowBookmarks(false)
  }, [])

  // OPTIMIZED: Debounced position updates during scroll
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const firstVisible = viewableItems[0].item
      if (firstVisible.type === 'ayah' && firstVisible.ayah) {
        debouncedUpdatePosition(firstVisible.ayah.globalIndex)
      }
    }
  }, [debouncedUpdatePosition])

  // OPTIMIZED: Dynamic height estimation based on text length
  const getEstimatedItemSize = useCallback((index: number, item: ListItem) => {
    if (item.type === 'surah') return estimateSurahHeaderHeight()
    return item.ayah ? estimateAyahHeight(item.ayah, fontSize) : 80
  }, [fontSize])

  // Initial scroll to saved position (O(1) lookup)
  useEffect(() => {
    if (currentPosition > 1) {
      const index = getListIndexForAyah(currentPosition)
      if (index > 0) {
        setTimeout(() => {
          listRef.current?.scrollToIndex({ index, animated: false })
        }, 100)
      }
    }
  }, []) // Only on mount

  // OPTIMIZED: Memoized render function
  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'surah' && item.surah) {
      return <SurahHeader surah={item.surah} />
    }
    if (item.type === 'ayah' && item.ayah) {
      const isBookmarked = bookmarks.some(b => b.globalIndex === item.ayah!.globalIndex)
      return <AyahView ayah={item.ayah} fontSize={fontSize} isBookmarked={isBookmarked} />
    }
    return null
  }, [bookmarks, fontSize])

  // OPTIMIZED: Stable key extractor
  const keyExtractor = useCallback((item: ListItem) =>
    item.type === 'surah' && item.surah
      ? `surah-${item.surah.id}`
      : `ayah-${item.ayah?.globalIndex ?? 0}`,
  [])

  // Item type for recycling optimization
  const getItemType = useCallback((item: ListItem) => item.type, [])

  // Current reading info for header
  const currentAyah = getAyah(currentPosition)
  const progressText = currentAyah
    ? `Page ${currentAyah.page} • Juz ${currentAyah.juz}`
    : 'Loading...'

  return (
    <View style={styles.container}>
      {/* Header with navigation + progress */}
      <View style={styles.header}>
        <Pressable onPress={() => setShowSurahList(true)} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Surahs</Text>
        </Pressable>
        <Text style={styles.progressText}>{progressText}</Text>
        <Pressable onPress={() => setShowBookmarks(true)} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Bookmarks</Text>
        </Pressable>
      </View>

      {/* OPTIMIZED LegendList */}
      <LegendList
        ref={listRef}
        data={listItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}

        // PERFORMANCE OPTIMIZATIONS
        recycleItems={true}
        initialContainerPoolRatio={1.5}
        drawDistance={300}
        getEstimatedItemSize={getEstimatedItemSize}
        getItemType={getItemType}

        // Visibility tracking (debounced)
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 10,
          minimumViewTime: 100,
        }}

        // Scroll stability
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        style={styles.list}
      />

      {/* Navigation Sheets */}
      <SurahListSheet
        visible={showSurahList}
        onClose={() => setShowSurahList(false)}
        onSelect={navigateToSurah}
        surahs={quranData.surahs}
      />

      <BookmarksSheet
        visible={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        onSelect={navigateToBookmark}
        bookmarks={bookmarks}
        onRemove={removeBookmark}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  headerButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
  },
  progressText: {
    color: '#888888',
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
})
```

---

## Task 4.4: Create Memoized AyahView Component

Create `components/mushaf/AyahView.tsx`:

```typescript
import React, { memo } from 'react'
import { Text, Pressable, StyleSheet } from 'react-native'
import { Ayah } from '../../data/quranLoader'

interface Props {
  ayah: Ayah
  fontSize?: number
  lineSpacing?: number
  isBookmarked?: boolean
  onPress?: () => void
  onLongPress?: () => void
}

const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

function toArabicNumber(num: number): string {
  return String(num).split('').map(d => arabicNumerals[parseInt(d)]).join('')
}

function AyahViewComponent({
  ayah,
  fontSize = 28,
  lineSpacing = 16,
  isBookmarked,
  onPress,
  onLongPress
}: Props) {
  const marker = `﴿${toArabicNumber(ayah.ayahNumber)}﴾`

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.container, { paddingVertical: lineSpacing }]}
    >
      <Text
        style={[
          styles.text,
          { fontSize, lineHeight: fontSize * 1.8 },
          isBookmarked && styles.bookmarked
        ]}
      >
        {ayah.textArabic} {marker}
      </Text>
    </Pressable>
  )
}

// CRITICAL: React.memo with custom comparison prevents unnecessary re-renders
export const AyahView = memo(AyahViewComponent, (prev, next) => {
  return (
    prev.ayah.globalIndex === next.ayah.globalIndex &&
    prev.fontSize === next.fontSize &&
    prev.lineSpacing === next.lineSpacing &&
    prev.isBookmarked === next.isBookmarked
  )
})

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  text: {
    fontFamily: 'KFGQPCHAFSUthmanicScript',
    writingDirection: 'rtl',
    textAlign: 'right',
    color: '#FFFFFF',
  },
  bookmarked: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
})
```

---

## Task 4.5: Create Memoized SurahHeader Component

Create `components/mushaf/SurahHeader.tsx`:

```typescript
import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Surah } from '../../data/quranLoader'

interface Props {
  surah: Surah
}

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'

function SurahHeaderComponent({ surah }: Props) {
  const showBismillah = surah.id !== 1 && surah.id !== 9

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.number}>{surah.id}</Text>
        <View style={styles.names}>
          <Text style={styles.arabicName}>{surah.nameArabic}</Text>
          <Text style={styles.englishName}>{surah.nameEnglish}</Text>
        </View>
        <Text style={styles.info}>{surah.ayahCount} Ayahs</Text>
      </View>

      {showBismillah && (
        <Text style={styles.bismillah}>{BISMILLAH}</Text>
      )}
    </View>
  )
}

// Memoize - surah headers rarely change
export const SurahHeader = memo(SurahHeaderComponent, (prev, next) => {
  return prev.surah.id === next.surah.id
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2A2A2A',
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  number: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 36,
    fontWeight: '600',
    fontSize: 16,
  },
  names: {
    flex: 1,
    marginLeft: 16,
  },
  arabicName: {
    fontFamily: 'KFGQPCHAFSUthmanicScript',
    fontSize: 24,
    color: '#FFFFFF',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  englishName: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  info: {
    fontSize: 12,
    color: '#666666',
  },
  bismillah: {
    fontFamily: 'KFGQPCHAFSUthmanicScript',
    fontSize: 22,
    color: '#D4AF37',
    textAlign: 'center',
    paddingVertical: 16,
    writingDirection: 'rtl',
  },
})
```

---

## Task 4.6: Commit Changes

```bash
git checkout -b feature/mushaf
git add .
git commit -m "Implement optimized Mushaf with LegendList, O(1) navigation, debounced persistence"
git push origin feature/mushaf
```

---

## Agent 4 Completion Checklist

- [ ] All 6,236 ayahs render smoothly
- [ ] **60 FPS scrolling** (verify with React Native Profiler)
- [ ] Arabic font displays correctly with diacritics
- [ ] Position persists across restarts (debounced)
- [ ] **O(1) surah/bookmark navigation** (instant)
- [ ] Bookmarks save and restore
- [ ] Progress indicator shows current page/juz
- [ ] No layout jumps during scroll

## Performance Metrics to Verify

| Metric | Target |
|--------|--------|
| Initial render | < 100ms |
| Navigation to any ayah | < 10ms |
| Scroll FPS | > 55 FPS |
| Memory (active) | < 100MB |
| Position save frequency | Every 500ms max |

---

# AGENT 5: Tracking, Settings & Theming

**Objective**: Implement night prayer tracking, settings screen, and theme system.
**Branch**: `feature/tracking-settings`
**Depends on**: Agent 1, Agent 2 (stores)

**Important**: Settings screen is at `app/settings.tsx` (root level, NOT in tabs). It's accessed via the gear icon in the header and opens as a modal.

---

## ⚠️ PREREQUISITE: Create UI Components First

Before implementing screens, run these GEMINI prompts from `GEMINI_COMPONENT_PROMPTS.md`:

| Prompt | Component | File Path |
|--------|-----------|-----------|
| Prompt 10 | DailyTracker | `components/tracking/DailyTracker.tsx` |
| Prompt 11 | StatsPanel | `components/tracking/StatsPanel.tsx` |
| Prompt 12 | HeatmapCalendar | `components/tracking/HeatmapCalendar.tsx` |
| Prompt 13 | ThemePicker | `components/settings/ThemePicker.tsx` |

These components are imported by the screens but defined only in GEMINI prompts.

---

## Task 5.1: Create Theme System

Create `theme/colors.ts`:

```typescript
export interface ThemeColors {
  primary: string
  primaryLight: string
  background: string
  surface: string
  surfaceElevated: string
  text: string
  textSecondary: string
  textMuted: string
  border: string
  success: string
  error: string
  warning: string
}

export const themes: Record<string, ThemeColors> = {
  'gold-light': {
    primary: '#D4AF37',
    primaryLight: '#F5E6B8',
    background: '#FFFEF7',
    surface: '#FFFFFF',
    surfaceElevated: '#F8F6F0',
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#888888',
    border: '#E5E5E5',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'gold-dark': {
    primary: '#D4AF37',
    primaryLight: '#3D3520',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    surfaceElevated: '#3A3A3A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textMuted: '#888888',
    border: '#3A3A3A',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'emerald-light': {
    primary: '#10B981',
    primaryLight: '#D1FAE5',
    background: '#F0FDF4',
    surface: '#FFFFFF',
    surfaceElevated: '#ECFDF5',
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#888888',
    border: '#D1FAE5',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'emerald-dark': {
    primary: '#10B981',
    primaryLight: '#064E3B',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceElevated: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textMuted: '#888888',
    border: '#1F3D2E',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'rose-light': {
    primary: '#F43F5E',
    primaryLight: '#FFE4E6',
    background: '#FFF1F2',
    surface: '#FFFFFF',
    surfaceElevated: '#FFF5F6',
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#888888',
    border: '#FECDD3',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'rose-dark': {
    primary: '#F43F5E',
    primaryLight: '#4C1D28',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceElevated: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textMuted: '#888888',
    border: '#3D1D26',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'purple-light': {
    primary: '#8B5CF6',
    primaryLight: '#EDE9FE',
    background: '#FAF5FF',
    surface: '#FFFFFF',
    surfaceElevated: '#F5F3FF',
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#888888',
    border: '#DDD6FE',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'purple-dark': {
    primary: '#8B5CF6',
    primaryLight: '#3B2066',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceElevated: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textMuted: '#888888',
    border: '#2E1D4E',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'amber-light': {
    primary: '#F59E0B',
    primaryLight: '#FEF3C7',
    background: '#FFFBEB',
    surface: '#FFFFFF',
    surfaceElevated: '#FEF9EE',
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#888888',
    border: '#FDE68A',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  'amber-dark': {
    primary: '#F59E0B',
    primaryLight: '#4D3A0A',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceElevated: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textMuted: '#888888',
    border: '#3D2E0A',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
}
```

---

## Task 5.2: Create Theme Provider

Create `theme/ThemeProvider.tsx`:

```typescript
import { createContext, useContext, ReactNode } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { themes, ThemeColors } from './colors'

const ThemeContext = createContext<ThemeColors>(themes['gold-dark'])

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { themeId } = useSettingsStore()
  const theme = themes[themeId] || themes['gold-dark']

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeColors {
  return useContext(ThemeContext)
}
```

---

## Task 5.3: Implement Tracking Screen

Replace `app/(tabs)/tracking.tsx`:

```typescript
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useTrackingStore } from '../../stores/trackingStore'
import { useTheme } from '../../theme/ThemeProvider'
import { DailyTracker } from '../../components/tracking/DailyTracker'
import { StatsPanel } from '../../components/tracking/StatsPanel'
import { HeatmapCalendar } from '../../components/tracking/HeatmapCalendar'

export default function TrackingScreen() {
  const theme = useTheme()
  const { getRecord, togglePrayer, getPoints, getStats, records } = useTrackingStore()

  const today = new Date().toISOString().split('T')[0]
  const record = getRecord(today)
  const points = getPoints(record)
  const stats = getStats()

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Night Prayers</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Track your Qiyam and Witr
        </Text>
      </View>

      <DailyTracker
        date={today}
        record={record}
        onToggle={(prayer) => togglePrayer(today, prayer)}
        points={points}
      />

      <StatsPanel stats={stats} />

      <HeatmapCalendar records={records} getPoints={getPoints} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
})
```

---

## Task 5.4: Implement Settings Screen

Replace `app/settings.tsx` (modal screen, NOT in tabs):

**Note**: Settings is accessed via the gear icon in the header, not as a tab. The file is at the root `app/` level, not inside `app/(tabs)/`.

```typescript
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native'
import { useSettingsStore, CalculationMethod } from '../stores/settingsStore'
import { useTheme } from '../theme/ThemeProvider'
import { ThemePicker } from '../components/settings/ThemePicker'

export default function SettingsScreen() {
  const theme = useTheme()
  const {
    themeId, setTheme,
    calculationMethod, setCalculationMethod,
    hapticsEnabled, setHapticsEnabled,
  } = useSettingsStore()

  const methodOptions: { id: CalculationMethod; label: string }[] = [
    { id: 'ummAlQura', label: 'Umm Al-Qura (Saudi)' },
    { id: 'muslimWorldLeague', label: 'Muslim World League' },
    { id: 'isna', label: 'ISNA (North America)' },
    { id: 'egyptian', label: 'Egyptian' },
    { id: 'karachi', label: 'Karachi' },
    { id: 'singapore', label: 'Singapore' },
    { id: 'turkey', label: 'Turkey' },
    { id: 'kuwait', label: 'Kuwait' },
    { id: 'qatar', label: 'Qatar' },
  ]

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Appearance
        </Text>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.text }]}>Theme</Text>
          <ThemePicker currentThemeId={themeId} onSelect={setTheme} />
        </View>

        <View style={[styles.row, { backgroundColor: theme.surface }]}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>Haptics</Text>
          <Switch
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
      </View>

      {/* Prayer Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Prayer Times
        </Text>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.text }]}>Calculation Method</Text>
          {methodOptions.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.methodOption, { borderBottomColor: theme.border }]}
              onPress={() => setCalculationMethod(option.id)}
            >
              <Text style={[styles.methodLabel, { color: theme.text }]}>
                {option.label}
              </Text>
              {calculationMethod === option.id && (
                <Text style={{ color: theme.primary, fontSize: 18 }}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          About
        </Text>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.aboutRow}>
            <Text style={[styles.label, { color: theme.text }]}>Version</Text>
            <Text style={[styles.value, { color: theme.textSecondary }]}>1.0.0</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  value: {
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  rowLabel: {
    fontSize: 16,
  },
  methodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  methodLabel: {
    fontSize: 15,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
```

---

## Task 5.5: Update Root Layout with Theme Provider

Update `app/_layout.tsx` to wrap with ThemeProvider (merge with Task 1.7's settings header):

```typescript
import { Stack, router } from 'expo-router'
import { useEffect } from 'react'
import { useFonts } from 'expo-font'
import { Pressable } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { Ionicons } from '@expo/vector-icons'
import { ThemeProvider, useTheme } from '../theme/ThemeProvider'

SplashScreen.preventAutoHideAsync()

function RootLayoutContent() {
  const theme = useTheme()

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/settings')}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="settings-outline" size={24} color={theme.primary} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'modal',
          headerTitle: 'Settings',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'KFGQPCHAFSUthmanicScript': require('../assets/fonts/KFGQPCHAFSUthmanicScript.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  )
}
```

---

## Task 5.6: Commit Changes

```bash
git checkout -b feature/tracking-settings
git add .
git commit -m "Implement tracking, settings, and 10-theme system"
git push origin feature/tracking-settings
```

---

## Agent 5 Completion Checklist

- [ ] All 10 themes render correctly
- [ ] Theme picker functional
- [ ] Tracking toggles work
- [ ] Stats calculate correctly
- [ ] Heatmap displays properly
- [ ] Settings persist

---

# AGENT 6: Quran Radio & Audio

**Objective**: Implement Quran radio with 13 reciters, audio playback, downloads, and sleep timer.
**Branch**: `feature/radio`
**Depends on**: Agent 1, Agent 2 (stores)

---

## Task 6.1: Update Audio Store with Full Implementation

Update `stores/audioStore.ts` with complete implementation:

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Audio } from 'expo-audio'
import * as FileSystem from 'expo-file-system'
import { mmkvStorage } from '../lib/mmkv'

export interface Reciter {
  id: string
  name: string
  nameArabic: string
  fileName: string
  fileSize: number
  isBundled: boolean
  isDownloaded: boolean
}

interface AudioState {
  // Playback state
  isPlaying: boolean
  currentReciter: Reciter | null
  sound: Audio.Sound | null
  duration: number
  position: number

  // Sleep timer
  sleepTimerMinutes: number | null
  sleepTimerEndTime: number | null

  // Downloads
  downloadProgress: Record<string, number>
  downloadedReciters: string[]

  // Reciter list
  reciters: Reciter[]

  // Actions
  play: (reciter: Reciter) => Promise<void>
  pause: () => Promise<void>
  stop: () => Promise<void>
  seekToRandom: () => Promise<void>
  setSleepTimer: (minutes: number | null) => void
  downloadReciter: (reciterId: string) => Promise<void>
  cancelDownload: (reciterId: string) => void
  isReciterAvailable: (reciterId: string) => boolean
  getAudioPath: (reciter: Reciter) => string
}

const AUDIO_BASE_URL = 'https://github.com/Qefaraki/quran-audio-assets/releases/download/audio-v1/'

// 8 bundled + 5 downloadable = 13 total reciters
const defaultReciters: Reciter[] = [
  // BUNDLED (included in app)
  { id: 'maher', name: 'Maher Almuaiqly', nameArabic: 'ماهر المعيقلي', fileName: 'maher.mp3', fileSize: 8200000, isBundled: true, isDownloaded: true },
  { id: 'ali_jaber', name: 'Ali Jaber', nameArabic: 'علي جابر', fileName: 'ali_jaber.mp3', fileSize: 29000000, isBundled: true, isDownloaded: true },
  { id: 'ahmad_taleb', name: 'Ahmad Bin Taleb', nameArabic: 'أحمد طالب بن حميد', fileName: 'ahmad_taleb.mp3', fileSize: 9400000, isBundled: true, isDownloaded: true },
  { id: 'qaraawi', name: 'Abdullah Alqaraawi', nameArabic: 'عبدالله القرعاوي', fileName: 'qaraawi.mp3', fileSize: 10000000, isBundled: true, isDownloaded: true },
  { id: 'souilass', name: 'Younes Asweilas', nameArabic: 'يونس اسويلص', fileName: 'souilass.mp3', fileSize: 16000000, isBundled: true, isDownloaded: true },
  { id: 'aidan', name: 'Abdulaziz Alaidan', nameArabic: 'عبدالعزيز العيدان', fileName: 'aidan.mp3', fileSize: 33000000, isBundled: true, isDownloaded: true },
  { id: 'najdiyyah', name: 'Najdiyyah Mix', nameArabic: 'النجدية', fileName: 'najdiyyah.mp3', fileSize: 18000000, isBundled: true, isDownloaded: true },
  { id: 'humaidi', name: 'Abdulaziz Alhumaidi', nameArabic: 'عبدالعزيز الحميدي', fileName: 'humaidi.mp3', fileSize: 7000000, isBundled: true, isDownloaded: true },

  // DOWNLOADABLE
  { id: 'yasser', name: 'Yasser Aldossari', nameArabic: 'ياسر الدوسري', fileName: 'yasser.mp3', fileSize: 354000000, isBundled: false, isDownloaded: false },
  { id: 'shuraim', name: 'Saud Alshuraim', nameArabic: 'سعود الشريم', fileName: 'shuraim.mp3', fileSize: 251000000, isBundled: false, isDownloaded: false },
  { id: 'sudais', name: 'Abdulrahman Alsudais', nameArabic: 'عبدالرحمن السديس', fileName: 'sudais.mp3', fileSize: 291000000, isBundled: false, isDownloaded: false },
  { id: 'ghamdi', name: 'Saad Alghamdi', nameArabic: 'سعد الغامدي', fileName: 'ghamdi.mp3', fileSize: 340000000, isBundled: false, isDownloaded: false },
  { id: 'aldamkh', name: 'Abdulaziz Aldamkh', nameArabic: 'عبدالعزيز الدمخ', fileName: 'aldamkh.mp3', fileSize: 126000000, isBundled: false, isDownloaded: false },
]

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentReciter: null,
      sound: null,
      duration: 0,
      position: 0,
      sleepTimerMinutes: null,
      sleepTimerEndTime: null,
      downloadProgress: {},
      downloadedReciters: [],
      reciters: defaultReciters,

      play: async (reciter) => {
        const { sound: existingSound, stop, getAudioPath } = get()

        // Stop any existing playback
        if (existingSound) {
          await stop()
        }

        try {
          const audioPath = getAudioPath(reciter)
          const newSound = new Audio.Sound()

          await newSound.loadAsync({ uri: audioPath })

          // Get duration
          const status = await newSound.getStatusAsync()
          const duration = status.isLoaded ? status.durationMillis || 0 : 0

          // Seek to random position (10-90% for radio feel)
          const minPos = duration * 0.1
          const maxPos = duration * 0.9
          const randomPos = Math.random() * (maxPos - minPos) + minPos
          await newSound.setPositionAsync(randomPos)

          // Start playing
          await newSound.playAsync()

          // Loop when finished
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              get().seekToRandom()
            }
          })

          set({
            sound: newSound,
            currentReciter: reciter,
            isPlaying: true,
            duration,
            position: randomPos,
          })
        } catch (error) {
          console.error('Failed to play audio:', error)
        }
      },

      pause: async () => {
        const { sound } = get()
        if (sound) {
          await sound.pauseAsync()
          set({ isPlaying: false })
        }
      },

      stop: async () => {
        const { sound } = get()
        if (sound) {
          await sound.stopAsync()
          await sound.unloadAsync()
          set({
            sound: null,
            currentReciter: null,
            isPlaying: false,
            position: 0,
          })
        }
      },

      seekToRandom: async () => {
        const { sound, duration } = get()
        if (sound && duration > 0) {
          const minPos = duration * 0.1
          const maxPos = duration * 0.9
          const randomPos = Math.random() * (maxPos - minPos) + minPos
          await sound.setPositionAsync(randomPos)
          await sound.playAsync()
          set({ position: randomPos, isPlaying: true })
        }
      },

      setSleepTimer: (minutes) => {
        if (minutes === null) {
          set({ sleepTimerMinutes: null, sleepTimerEndTime: null })
        } else {
          set({
            sleepTimerMinutes: minutes,
            sleepTimerEndTime: Date.now() + minutes * 60 * 1000,
          })
        }
      },

      downloadReciter: async (reciterId) => {
        const { reciters } = get()
        const reciter = reciters.find(r => r.id === reciterId)
        if (!reciter || reciter.isBundled) return

        const downloadUrl = `${AUDIO_BASE_URL}${reciter.fileName}`
        const localPath = `${FileSystem.documentDirectory}audio/${reciter.fileName}`

        // Ensure directory exists
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}audio/`, { intermediates: true })

        // Download with progress
        const downloadResumable = FileSystem.createDownloadResumable(
          downloadUrl,
          localPath,
          {},
          (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite
            set((state) => ({
              downloadProgress: { ...state.downloadProgress, [reciterId]: progress },
            }))
          }
        )

        try {
          await downloadResumable.downloadAsync()

          set((state) => ({
            downloadedReciters: [...state.downloadedReciters, reciterId],
            reciters: state.reciters.map(r =>
              r.id === reciterId ? { ...r, isDownloaded: true } : r
            ),
            downloadProgress: { ...state.downloadProgress, [reciterId]: 1 },
          }))
        } catch (error) {
          console.error('Download failed:', error)
          set((state) => ({
            downloadProgress: { ...state.downloadProgress, [reciterId]: 0 },
          }))
        }
      },

      cancelDownload: (reciterId) => {
        // TODO: Implement download cancellation
        set((state) => ({
          downloadProgress: { ...state.downloadProgress, [reciterId]: 0 },
        }))
      },

      isReciterAvailable: (reciterId) => {
        const { reciters, downloadedReciters } = get()
        const reciter = reciters.find(r => r.id === reciterId)
        if (!reciter) return false
        return reciter.isBundled || downloadedReciters.includes(reciterId)
      },

      getAudioPath: (reciter) => {
        if (reciter.isBundled) {
          // Bundled audio - use require
          // Note: In actual implementation, use Asset.fromModule
          return `asset:///audio/${reciter.fileName}`
        } else {
          // Downloaded audio
          return `${FileSystem.documentDirectory}audio/${reciter.fileName}`
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
```

---

## Task 6.2: Create Radio Screen

Create `app/(tabs)/radio.tsx`:

```typescript
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native'
import { useAudioStore, Reciter } from '../../stores/audioStore'
import { useTheme } from '../../theme/ThemeProvider'
import { ReciterCard } from '../../components/radio/ReciterCard'
import { NowPlayingBar } from '../../components/radio/NowPlayingBar'
import { SleepTimerSheet } from '../../components/radio/SleepTimerSheet'
import { useState, useEffect } from 'react'

export default function RadioScreen() {
  const theme = useTheme()
  const {
    reciters,
    currentReciter,
    isPlaying,
    play,
    pause,
    stop,
    sleepTimerEndTime,
    setSleepTimer,
    downloadReciter,
    downloadProgress,
    isReciterAvailable,
  } = useAudioStore()

  const [showSleepTimer, setShowSleepTimer] = useState(false)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)

  // Update remaining time every second
  useEffect(() => {
    if (!sleepTimerEndTime) {
      setRemainingTime(null)
      return
    }

    const interval = setInterval(() => {
      const remaining = sleepTimerEndTime - Date.now()
      if (remaining <= 0) {
        stop()
        setSleepTimer(null)
        setRemainingTime(null)
      } else {
        setRemainingTime(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [sleepTimerEndTime])

  const handleReciterPress = async (reciter: Reciter) => {
    if (!isReciterAvailable(reciter.id)) {
      // Start download
      downloadReciter(reciter.id)
      return
    }

    if (currentReciter?.id === reciter.id) {
      // Toggle play/pause
      if (isPlaying) {
        await pause()
      } else {
        await play(reciter)
      }
    } else {
      // Play new reciter
      await play(reciter)
    }
  }

  const renderReciter = ({ item }: { item: Reciter }) => (
    <ReciterCard
      reciter={item}
      isPlaying={isPlaying && currentReciter?.id === item.id}
      isAvailable={isReciterAvailable(item.id)}
      downloadProgress={downloadProgress[item.id] || 0}
      onPress={() => handleReciterPress(item)}
    />
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Quran Radio</Text>
        <Pressable onPress={() => setShowSleepTimer(true)}>
          <Text style={[styles.sleepButton, { color: theme.primary }]}>
            {remainingTime ? formatTime(remainingTime) : 'Sleep Timer'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={reciters}
        renderItem={renderReciter}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      {currentReciter && (
        <NowPlayingBar
          reciter={currentReciter}
          isPlaying={isPlaying}
          onPlayPause={() => isPlaying ? pause() : play(currentReciter)}
          onStop={stop}
        />
      )}

      <SleepTimerSheet
        visible={showSleepTimer}
        onClose={() => setShowSleepTimer(false)}
        onSelect={(minutes) => {
          setSleepTimer(minutes)
          setShowSleepTimer(false)
        }}
        currentTimer={remainingTime}
      />
    </View>
  )
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  sleepButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
})
```

---

## Task 6.3: Create ReciterCard Component

Create `components/radio/ReciterCard.tsx`:

```typescript
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme/ThemeProvider'
import { Reciter } from '../../stores/audioStore'

interface Props {
  reciter: Reciter
  isPlaying: boolean
  isAvailable: boolean
  downloadProgress: number
  onPress: () => void
}

export function ReciterCard({ reciter, isPlaying, isAvailable, downloadProgress, onPress }: Props) {
  const theme = useTheme()

  const isDownloading = downloadProgress > 0 && downloadProgress < 1

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return mb >= 100 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`
  }

  return (
    <Pressable
      style={[styles.container, { backgroundColor: theme.surface }]}
      onPress={onPress}
    >
      <View style={styles.info}>
        <Text style={[styles.arabicName, { color: theme.text }]}>
          {reciter.nameArabic}
        </Text>
        <Text style={[styles.englishName, { color: theme.textSecondary }]}>
          {reciter.name}
        </Text>
        {!reciter.isBundled && (
          <Text style={[styles.size, { color: theme.textMuted }]}>
            {formatSize(reciter.fileSize)}
          </Text>
        )}
      </View>

      <View style={styles.action}>
        {isDownloading ? (
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: theme.primary }]}>
              {Math.round(downloadProgress * 100)}%
            </Text>
          </View>
        ) : isPlaying ? (
          <Ionicons name="pause-circle" size={48} color={theme.primary} />
        ) : isAvailable ? (
          <Ionicons name="play-circle" size={48} color={theme.primary} />
        ) : (
          <Ionicons name="cloud-download-outline" size={32} color={theme.textMuted} />
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  info: {
    flex: 1,
  },
  arabicName: {
    fontSize: 20,
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  englishName: {
    fontSize: 14,
    marginTop: 4,
  },
  size: {
    fontSize: 12,
    marginTop: 2,
  },
  action: {
    marginLeft: 16,
  },
  progressContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
})
```

---

## Task 6.4: Create NowPlayingBar Component

Create `components/radio/NowPlayingBar.tsx`:

```typescript
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme/ThemeProvider'
import { Reciter } from '../../stores/audioStore'

interface Props {
  reciter: Reciter
  isPlaying: boolean
  onPlayPause: () => void
  onStop: () => void
}

export function NowPlayingBar({ reciter, isPlaying, onPlayPause, onStop }: Props) {
  const theme = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.info}>
        <Text style={[styles.label, { color: theme.textMuted }]}>Now Playing</Text>
        <Text style={[styles.name, { color: theme.text }]}>{reciter.nameArabic}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={onPlayPause} style={styles.button}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={28}
            color={theme.primary}
          />
        </Pressable>

        <Pressable onPress={onStop} style={styles.button}>
          <Ionicons name="stop" size={28} color={theme.textMuted} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 8,
    marginLeft: 8,
  },
})
```

---

## Task 6.5: Create SleepTimerSheet Component

Create `components/radio/SleepTimerSheet.tsx`:

```typescript
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native'
import { useTheme } from '../../theme/ThemeProvider'

interface Props {
  visible: boolean
  onClose: () => void
  onSelect: (minutes: number | null) => void
  currentTimer: number | null
}

const TIMER_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '60 minutes', value: 60 },
]

export function SleepTimerSheet({ visible, onClose, onSelect, currentTimer }: Props) {
  const theme = useTheme()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>Sleep Timer</Text>

          {TIMER_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[styles.option, { borderBottomColor: theme.border }]}
              onPress={() => onSelect(option.value)}
            >
              <Text style={[styles.optionText, { color: theme.text }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}

          {currentTimer && (
            <Pressable
              style={[styles.option, { borderBottomColor: theme.border }]}
              onPress={() => onSelect(null)}
            >
              <Text style={[styles.optionText, { color: theme.error }]}>
                Cancel Timer
              </Text>
            </Pressable>
          )}

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelText, { color: theme.textMuted }]}>
              Close
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 18,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
    textAlign: 'center',
  },
})
```

---

## Task 6.6: Add Radio Tab to Tab Layout

Update `app/(tabs)/_layout.tsx` to include Radio tab:

```typescript
<Tabs.Screen
  name="radio"
  options={{
    title: 'Radio',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="radio-outline" size={size} color={color} />
    ),
  }}
/>
```

Insert this BEFORE the settings tab in the existing file.

---

## Task 6.7: Commit Changes

```bash
git checkout -b feature/radio
git add .
git commit -m "Implement Quran radio with 13 reciters, downloads, and sleep timer"
git push origin feature/radio
```

---

## Agent 6 Completion Checklist

- [ ] All 13 reciters display in list
- [ ] Bundled reciters play immediately
- [ ] Download progress shows for downloadable reciters
- [ ] Downloads complete and persist
- [ ] Sleep timer functions (15/30/60 minutes)
- [ ] Now Playing bar shows current reciter
- [ ] Play/Pause/Stop controls work
- [ ] Audio continues in background
- [ ] Random seek creates "radio feel"

---

# INTEGRATION TASKS (After All Agents Complete)

## Merge All Branches

```bash
git checkout main
git merge feature/stores
git merge feature/prayer-qibla
git merge feature/mushaf
git merge feature/tracking-settings
git merge feature/radio
git push origin main
```

## Final Validation

Run through the full validation checklist from `ORCHESTRATOR_PLAN.md`.
