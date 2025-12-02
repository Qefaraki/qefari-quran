# Qefari Quran - React Native Expo Migration

## Project Overview

**What**: Migrate Qefari Qibla (iOS Swift/SwiftUI) to React Native Expo as "Qefari Quran"
**Why**: Enable Android support + fix existing state management and performance issues
**Approach**: Full rewrite with 5 parallel agent workstreams

---

## ⚠️ CRITICAL: Development Build Required

**This project CANNOT run in Expo Go.** The following packages require native modules:
- `react-native-mmkv` - Requires native build
- `react-native-nitro-modules` - MMKV peer dependency

You MUST use a development build:
```bash
# After installing dependencies, run:
npx expo prebuild
npx expo run:ios  # or run:android
```

Do NOT attempt to test with Expo Go - the app will crash immediately.

---

## Repository Setup

```
Repository Name: qefari-quran
Bundle ID (iOS): com.qefari.quran
Package (Android): com.qefari.quran
```

---

## Technology Stack (Validated)

| Category | Technology | Reason |
|----------|------------|--------|
| Framework | React Native 0.81 + Expo SDK 54 | Managed workflow, OTA updates |
| Navigation | Expo Router + Native Tabs | Platform-native tab bar experience |
| Tabs | `expo-router/unstable-native-tabs` | iOS/Android native tab bars |
| State | Zustand + MMKV 4.0.1+ | Synchronous, 30x faster than AsyncStorage |
| Lists | @legendapp/list | Handles 6,236 ayahs smoothly |
| Audio | expo-audio | expo-av is deprecated (removed SDK 55) |
| Compass | expo-location (watchHeadingAsync) | Magnetometer is inaccurate |
| Prayer Calc | adhan (npm) | Identical to adhan-swift |
| Fonts | expo-font | Arabic Quran font |
| Haptics | expo-haptics | Tactile feedback |

**Critical**: This requires a development build, NOT Expo Go.

### SDK 54 Notes
- Android has edge-to-edge enabled by default (mandatory)
- `expo-file-system` new API is default; legacy at `expo-file-system/legacy`
- No `statusBar` field in app.json (removed in SDK 54)

---

## App Features (Full Parity)

### 1. Prayer Times
- 6 daily prayers with times
- Next prayer countdown
- 9 calculation methods (Umm Al-Qura default)
- Location-based or manual coordinates
- Notification settings per prayer

### 2. Qibla Compass
- Live compass heading via watchHeadingAsync
- Qibla direction calculation (Great Circle)
- Haptic feedback on alignment (within 5°)
- Visual indicator and degree display

### 3. Mushaf (Quran Reader)
- 6,236 ayahs in continuous scroll
- Arabic font (KFGQPC Uthmanic HAFS)
- Position persistence (remembers last read)
- Surah navigation sheet (114 surahs)
- Multi-color bookmarks (8 colors)
- Adjustable font size and line spacing

### 4. Night Prayer Tracking
- Track Tahajjud (4 × 2 rak'ah) + Witr
- Points system (max 9 per night)
- Streak tracking (current/best)
- Heatmap calendar (GitHub-style)
- Statistics panel

### 5. Quran Radio
- 13 reciters (8 bundled + 5 downloadable)
- Full Quran continuous playback (radio-style)
- Sleep timer (15/30/60 minutes)
- Background audio with lock screen controls
- Download manager with progress tracking
- Waveform visualizer
- Random position seek for "radio feel"

### 6. Settings (Header Modal)
- Accessed via gear icon in navigation header (not a tab)
- 10 themes (5 colors × light/dark)
- Language (system/en/ar)
- Numeral style (western/arabic/system)
- Calendar type (gregorian/hijri)
- Calculation method selector
- Haptics toggle
- Manual location override
- Per-prayer notification settings (adhan + iqama timing)

**Navigation Structure**: 5 native tabs + Settings in header (Android native tabs limited to 5)

---

## Architecture

### Directory Structure
```
qefari-quran/
├── app/                      # Expo Router screens
│   ├── _layout.tsx           # Root layout + providers + settings header
│   ├── settings.tsx          # Settings (modal, accessed from header)
│   └── (tabs)/
│       ├── _layout.tsx       # Native Tabs navigator (5 tabs)
│       ├── index.tsx         # Prayer Times
│       ├── qibla.tsx         # Qibla Compass
│       ├── mushaf.tsx        # Quran Reader
│       ├── tracking.tsx      # Night Prayer Tracking
│       └── radio.tsx         # Quran Radio
├── components/               # UI Components
│   ├── prayer/
│   ├── qibla/
│   ├── mushaf/
│   ├── tracking/
│   ├── radio/
│   ├── settings/
│   └── ui/
├── stores/                   # Zustand stores
│   ├── settingsStore.ts
│   ├── locationStore.ts
│   ├── prayerStore.ts
│   ├── mushafStore.ts
│   ├── trackingStore.ts
│   └── audioStore.ts
├── services/                 # Business logic
│   ├── prayerCalculation.ts
│   └── qiblaCalculation.ts
├── hooks/                    # Custom hooks
│   └── useCompassHeading.ts
├── theme/                    # Theming
│   ├── colors.ts
│   └── ThemeProvider.tsx
├── data/                     # Static data
│   ├── quran.json
│   └── quranLoader.ts
├── lib/                      # Utilities
│   └── mmkv.ts
├── utils/
│   └── timezone.ts
└── assets/
    ├── fonts/
    │   └── KFGQPCHAFSUthmanicScript.ttf
    └── images/
```

### State Architecture
```
┌─────────────────────────────────────────────────────────┐
│                      MMKV Storage                        │
│  (Synchronous, persisted, 30x faster than AsyncStorage) │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│SettingsStore │    │ MushafStore  │    │TrackingStore │
│- theme       │    │- position    │    │- records     │
│- language    │    │- bookmarks   │    │- streaks     │
│- calcMethod  │    │- fontSize    │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    ┌──────────────┐
                    │   UI Layer   │
                    │  (Reactive)  │
                    └──────────────┘
```

---

## Agent Execution Strategy

### Dependency Graph
```
Agent 1 (Foundation) ──► Agent 2 (Stores) ──┬──► Agent 3 (Prayer/Qibla)──┐
                                            │                            │
                                            ├──► Agent 4 (Mushaf) ───────┼──► Integration
                                            │                            │
                                            ├──► Agent 5 (Tracking) ─────┤
                                            │                            │
                                            └──► Agent 6 (Radio) ────────┘
```

**Corrected Execution Order**:
1. Agent 1 completes first (project setup)
2. Agent 2 completes second (stores are dependencies for all features)
3. Agents 3-6 run in parallel (all depend on Agent 2's stores)

### Agent Assignments

| Agent | Scope | Branch |
|-------|-------|--------|
| 1 | Project setup, GitHub, Expo config, MMKV, directory structure | `main` |
| 2 | All 6 Zustand stores, MMKV persistence, Quran data loader | `feature/stores` |
| 3 | Prayer calculation, Qibla compass, location services | `feature/prayer-qibla` |
| 4 | Mushaf with Legend List, Arabic font, bookmarks, navigation | `feature/mushaf` |
| 5 | Tracking, settings screen, theme system (10 themes) | `feature/tracking-settings` |
| 6 | Radio screen, audio playback, download manager, sleep timer | `feature/radio` |

---

## Files to Copy from Swift Project

Source: `/Users/alqefari/Desktop/qiyam-swift/`

| File | Destination | Size |
|------|-------------|------|
| `QefariQibla/Resources/quran.json` | `data/quran.json` | ~1.3MB |
| `QefariQibla/Resources/Fonts/KFGQPCHAFSUthmanicScript.ttf` | `assets/fonts/KFGQPCHAFSUthmanicScript.ttf` | ~1MB |
| `QefariQibla/Resources/Audio/*.mp3` | `assets/audio/` | ~130MB (8 files) |

**Note**: Keep the original font filename to avoid confusion. Reference it as `KFGQPCHAFSUthmanicScript` in code.

---

## Critical Implementation Notes

### 1. MMKV Setup (Not AsyncStorage)
```typescript
// lib/mmkv.ts
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

export const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
}
```

### 2. Compass Heading (Not Magnetometer)
```typescript
// Use expo-location, NOT expo-sensors Magnetometer
import * as Location from 'expo-location'

const subscription = await Location.watchHeadingAsync((heading) => {
  setHeading(heading.magHeading) // This matches device compass
})
```

### 3. Audio (expo-audio, NOT expo-av)
```typescript
// expo-av is deprecated in SDK 52, removed in SDK 55
// Use Audio.Sound class (NOT useAudioPlayer hook)
import { Audio } from 'expo-audio'

// Create and load sound
const sound = new Audio.Sound()
await sound.loadAsync({ uri: audioSource })
await sound.playAsync()

// Cleanup when done
await sound.unloadAsync()
```

### 4. Legend List for Mushaf
```typescript
import { LegendList } from '@legendapp/list'

<LegendList
  data={ayahs}
  estimatedItemSize={80}
  renderItem={({ item }) => <AyahView ayah={item} />}
/>
```

---

## Validation Checklist

Before considering migration complete:

- [ ] All 5 tabs functional (Prayer, Qibla, Mushaf, Tracking, Radio) + Settings modal
- [ ] Prayer times match Swift app for same location
- [ ] Qibla direction accurate (test against physical compass)
- [ ] Mushaf scrolls smoothly through all 6,236 ayahs
- [ ] Position persists across app restarts
- [ ] Bookmarks save and restore
- [ ] Tracking records persist
- [ ] All 10 themes render correctly
- [ ] Settings persist across restarts
- [ ] Radio plays bundled audio files
- [ ] Radio download manager works for downloadable reciters
- [ ] Sleep timer functions correctly
- [ ] Development build runs on physical device (NOT Expo Go)
- [ ] Android build successful

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| `DETAILED_TASKS.md` | Granular task breakdown for each agent |
| `GEMINI_COMPONENT_PROMPTS.md` | Prompts for Gemini to create UI components |
| `AUDIO_OPUS_MIGRATION_PLAN.md` | Audio format optimization (MP3 → AAC) |

---

## Quick Start for Orchestrator Agent

1. Read this entire document
2. Execute Agent 1 tasks from `DETAILED_TASKS.md`
3. Wait for Agent 1 completion
4. Execute Agent 2 tasks (stores are dependencies for features)
5. Wait for Agent 2 completion
6. Launch Agents 3-6 in parallel (they can all run simultaneously now)
7. Use `GEMINI_COMPONENT_PROMPTS.md` for component creation (can run alongside)
8. Merge all branches to main
9. Run validation checklist

**Important**: Do NOT skip Agent 2 before running feature agents - they all depend on the stores!
