# Gemini Component Design Prompts

This document contains prompts for Gemini to create all UI components for the Qefari Quran app.
Each prompt is self-contained and includes all necessary context.

---

## Instructions for Using These Prompts

1. Copy the entire prompt block (including the PROMPT START/END markers)
2. Paste into Gemini
3. Gemini will generate the component code
4. Place the generated file in the specified location

---

## Component List Overview

| Component | Location | Purpose |
|-----------|----------|---------|
| ArabicText | `components/ui/ArabicText.tsx` | RTL Arabic text with Quran font |
| PrayerTimeRow | `components/prayer/PrayerTimeRow.tsx` | Single prayer time display |
| NextPrayerCountdown | `components/prayer/NextPrayerCountdown.tsx` | Countdown timer |
| CompassDial | `components/qibla/CompassDial.tsx` | Rotating compass background |
| QiblaArrow | `components/qibla/QiblaArrow.tsx` | Animated arrow pointing to Kaaba |
| AyahView | `components/mushaf/AyahView.tsx` | Single Quran verse display |
| SurahHeader | `components/mushaf/SurahHeader.tsx` | Surah divider with bismillah |
| SurahListSheet | `components/mushaf/SurahListSheet.tsx` | Modal list of 114 surahs |
| BookmarksSheet | `components/mushaf/BookmarksSheet.tsx` | Modal list of bookmarks |
| DailyTracker | `components/tracking/DailyTracker.tsx` | Night prayer toggle buttons |
| StatsPanel | `components/tracking/StatsPanel.tsx` | Statistics grid |
| HeatmapCalendar | `components/tracking/HeatmapCalendar.tsx` | GitHub-style activity grid |
| ThemePicker | `components/settings/ThemePicker.tsx` | Theme selection grid |
| SettingsRow | `components/settings/SettingsRow.tsx` | Generic settings row |

---

# PROMPT 1: ArabicText Component

```
=== PROMPT START ===

Create a React Native component called ArabicText for displaying Arabic Quran text.

REQUIREMENTS:
- File location: components/ui/ArabicText.tsx
- Framework: React Native (NOT React web)
- Language: TypeScript
- Font: Use fontFamily 'KFGQPCHAFSUthmanicScript' (assume it's already loaded)

COMPONENT SPECS:
- Extends React Native Text component
- Props:
  - size?: number (default 28) - font size
  - All standard TextProps from React Native
- Styling:
  - writingDirection: 'rtl'
  - textAlign: 'right'
  - color: '#FFFFFF' (default, can be overridden)
  - lineHeight: 1.8 × fontSize
  - fontFamily: 'KFGQPCHAFSUthmanicScript'

EXAMPLE USAGE:
<ArabicText size={32}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</ArabicText>
<ArabicText size={24} style={{ color: '#D4AF37' }}>الفاتحة</ArabicText>

OUTPUT:
- Only the component code
- Use StyleSheet.create for styles
- Include TypeScript types
- No comments needed

=== PROMPT END ===
```

---

# PROMPT 2: PrayerTimeRow Component

```
=== PROMPT START ===

Create a React Native component called PrayerTimeRow for displaying a single prayer time.

REQUIREMENTS:
- File location: components/prayer/PrayerTimeRow.tsx
- Framework: React Native (NOT React web)
- Language: TypeScript

PROPS INTERFACE:
interface Props {
  prayer: {
    name: string        // "Fajr", "Dhuhr", etc.
    nameArabic: string  // "الفجر", "الظهر", etc.
    time: string        // "05:23" format
    isPast: boolean     // true if prayer time has passed
    isNext: boolean     // true if this is the next prayer
  }
}

VISUAL DESIGN:
- Horizontal row layout
- Left side: English name + Arabic name (smaller, muted color)
- Right side: Time in large text
- Background:
  - Normal: #2A2A2A
  - isNext: #3A3A3A with gold border (#D4AF37)
- Text colors:
  - Normal: #FFFFFF
  - isPast: #666666 (dimmed)
  - isNext time: #D4AF37 (gold)
- Border radius: 12px
- Padding: 16px vertical, 20px horizontal
- Margin: 4px vertical

OUTPUT:
- Only the component code
- Use StyleSheet.create
- Include TypeScript types

=== PROMPT END ===
```

---

# PROMPT 3: NextPrayerCountdown Component

```
=== PROMPT START ===

Create a React Native component called NextPrayerCountdown that shows time remaining until next prayer.

REQUIREMENTS:
- File location: components/prayer/NextPrayerCountdown.tsx
- Framework: React Native
- Language: TypeScript

PROPS:
interface Props {
  prayer: {
    name: string
    date: Date  // The prayer time as a Date object
  }
}

BEHAVIOR:
- Calculate time remaining: prayer.date - now
- Update every minute using setInterval
- Format output:
  - If > 1 hour: "2h 34m"
  - If < 1 hour: "34m"
  - If passed: "Now"

VISUAL DESIGN:
- Label: "Next: {prayer.name}" in #888888, 14px
- Countdown: Large text, 48px, bold, color #D4AF37 (gold)
- Stack vertically with 8px gap

OUTPUT:
- Component code only
- Include useEffect for timer
- Include cleanup for interval

=== PROMPT END ===
```

---

# PROMPT 4: CompassDial Component

```
=== PROMPT START ===

Create a React Native component called CompassDial - a rotating compass background for the Qibla screen.

REQUIREMENTS:
- File location: components/qibla/CompassDial.tsx
- Framework: React Native with react-native-reanimated
- Language: TypeScript

PROPS:
interface Props {
  rotation: number  // Degrees to rotate (negative of device heading)
}

VISUAL DESIGN:
- Circular dial, 260px diameter
- Border: 3px solid #3A3A3A
- Cardinal direction markers:
  - North (N): Red marker (#FF6B6B), at top
  - East (E): Gray marker (#666666), at right
  - South (S): Gray marker, at bottom
  - West (W): Gray marker, at left
- Markers are small rectangles (4px wide, 20px tall for N/S, 20px wide 4px tall for E/W)
- Entire dial rotates based on rotation prop

ANIMATION:
- Use Animated.View from react-native-reanimated
- Use useAnimatedStyle
- Rotation should be smooth

OUTPUT:
- Component code only
- Import from react-native-reanimated

=== PROMPT END ===
```

---

# PROMPT 5: QiblaArrow Component

```
=== PROMPT START ===

Create a React Native component called QiblaArrow - an animated arrow pointing toward the Kaaba.

REQUIREMENTS:
- File location: components/qibla/QiblaArrow.tsx
- Framework: React Native with react-native-reanimated
- Language: TypeScript

PROPS:
interface Props {
  rotation: number  // Degrees (qiblaDirection - heading)
}

VISUAL DESIGN:
- Arrow pointing upward by default
- Arrow head: Triangle using CSS borders
  - Width: 30px (15px each side)
  - Height: 100px
  - Color: #D4AF37 (gold)
- Kaaba icon at tip:
  - Small square 24x24px
  - Background: #1A1A1A
  - Border: 2px solid #D4AF37
- Total height: ~200px

ANIMATION:
- Use withSpring for smooth rotation
- Spring config: { damping: 15 }
- Rotation transforms based on prop

OUTPUT:
- Component code only
- Use react-native-reanimated

=== PROMPT END ===
```

---

# PROMPT 6: AyahView Component

```
=== PROMPT START ===

Create a React Native component called AyahView for displaying a single Quran verse.

REQUIREMENTS:
- File location: components/mushaf/AyahView.tsx
- Framework: React Native
- Language: TypeScript

PROPS:
interface Props {
  ayah: {
    globalIndex: number
    surahNumber: number
    ayahNumber: number
    textArabic: string  // Arabic text of the verse
  }
  fontSize?: number  // Default 28
  lineSpacing?: number  // Default 16
  isBookmarked?: boolean
  onPress?: () => void
  onLongPress?: () => void
}

VISUAL DESIGN:
- Full width container
- Padding: 16px horizontal, lineSpacing vertical
- Arabic text with KFGQPCHAFSUthmanicScript font
- After the text, show ayah number marker in Arabic numerals format: ﴿١٢٣﴾
- If bookmarked, add subtle gold background tint: rgba(212, 175, 55, 0.1)
- Text is right-aligned, RTL direction

ARABIC NUMBER CONVERSION:
const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
Convert ayahNumber to Arabic: 123 → ١٢٣

INTERACTIONS:
- Pressable wrapper
- onPress and onLongPress handlers

OUTPUT:
- Component code only
- Include Arabic numeral conversion function

=== PROMPT END ===
```

---

# PROMPT 7: SurahHeader Component

```
=== PROMPT START ===

Create a React Native component called SurahHeader for displaying a surah divider in the Mushaf.

REQUIREMENTS:
- File location: components/mushaf/SurahHeader.tsx
- Framework: React Native
- Language: TypeScript

PROPS:
interface Props {
  surah: {
    id: number            // 1-114
    nameArabic: string    // "الفاتحة"
    nameEnglish: string   // "Al-Fātiḥah"
    ayahCount: number     // 7
  }
}

VISUAL DESIGN:
- Container: #2A2A2A background, 12px border radius, 16px margin vertical
- Header row:
  - Left: Surah number in circle (36px, gold background #D4AF37, dark text)
  - Center: Arabic name (24px, white) + English name below (14px, #888888)
  - Right: Ayah count (12px, #666666)
- Bismillah section (only if surah.id !== 1 && surah.id !== 9):
  - Text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
  - Size: 22px
  - Color: #D4AF37 (gold)
  - Centered, 16px padding vertical
  - Border top: 1px solid #3A3A3A

OUTPUT:
- Component code only
- Handle bismillah conditional

=== PROMPT END ===
```

---

# PROMPT 8: SurahListSheet Component

```
=== PROMPT START ===

Create a React Native component called SurahListSheet - a modal bottom sheet listing all 114 surahs.

REQUIREMENTS:
- File location: components/mushaf/SurahListSheet.tsx
- Framework: React Native (use Modal component)
- Language: TypeScript

PROPS:
interface Props {
  visible: boolean
  onClose: () => void
  onSelect: (surahId: number) => void
  surahs: Array<{
    id: number
    nameArabic: string
    nameEnglish: string
    ayahCount: number
  }>
}

VISUAL DESIGN:
- Modal with presentationStyle="pageSheet", animationType="slide"
- Background: #1A1A1A
- Header:
  - Title: "Surahs" (20px, white, bold)
  - "Done" button on right (16px, gold #D4AF37)
  - Border bottom: 1px #2A2A2A
- List (FlatList):
  - Each row:
    - Number in circle (32px, #2A2A2A background)
    - Arabic name (20px) + English name (14px, #888888) below
    - Ayah count on right (14px, #666666)
  - Row padding: 16px
  - Border bottom: 1px #2A2A2A
  - Pressable, calls onSelect(id)

OUTPUT:
- Component code only
- Use FlatList for performance

=== PROMPT END ===
```

---

# PROMPT 9: BookmarksSheet Component

```
=== PROMPT START ===

Create a React Native component called BookmarksSheet - a modal showing saved bookmarks.

REQUIREMENTS:
- File location: components/mushaf/BookmarksSheet.tsx
- Framework: React Native
- Language: TypeScript

PROPS:
interface Props {
  visible: boolean
  onClose: () => void
  onSelect: (globalIndex: number) => void
  bookmarks: Array<{
    id: string
    globalIndex: number
    surahNumber: number
    ayahNumber: number
    colorIndex: number  // 0-7
    createdAt: string
  }>
  onRemove: (id: string) => void
}

BOOKMARK COLORS (8 total):
const BOOKMARK_COLORS = [
  '#D4AF37', // Gold
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#A78BFA', // Purple
  '#F97316', // Orange
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#EC4899', // Pink
]

VISUAL DESIGN:
- Modal same as SurahListSheet
- Header: "Bookmarks" + "Done" button
- If empty:
  - Centered message: "No bookmarks yet" (#888888, 18px)
  - Hint: "Long press on an ayah to bookmark" (#666666, 14px)
- Each row:
  - Color dot (12px circle, color from BOOKMARK_COLORS[colorIndex])
  - Surah name + "Ayah X" below
  - "Remove" button on right (14px, #FF6B6B)
- Pressable row calls onSelect(globalIndex)

OUTPUT:
- Component code only
- Handle empty state

=== PROMPT END ===
```

---

# PROMPT 10: DailyTracker Component

```
=== PROMPT START ===

Create a React Native component called DailyTracker for tracking night prayers.

REQUIREMENTS:
- File location: components/tracking/DailyTracker.tsx
- Framework: React Native
- Language: TypeScript

PROPS:
interface Props {
  date: string  // "2024-01-15" format
  record: {
    tahajjud1: boolean
    tahajjud2: boolean
    tahajjud3: boolean
    tahajjud4: boolean
    witr: boolean
  }
  onToggle: (prayer: 'tahajjud1' | 'tahajjud2' | 'tahajjud3' | 'tahajjud4' | 'witr') => void
  points: number  // Current points (max 9)
}

PRAYER BUTTONS:
const prayers = [
  { key: 'tahajjud1', label: 'Tahajjud 1', points: 2 },
  { key: 'tahajjud2', label: 'Tahajjud 2', points: 2 },
  { key: 'tahajjud3', label: 'Tahajjud 3', points: 2 },
  { key: 'tahajjud4', label: 'Tahajjud 4', points: 2 },
  { key: 'witr', label: 'Witr', points: 1 },
]

VISUAL DESIGN:
- Container: surface color, 16px border radius, 20px padding
- Header row: "Today" label + "{points}/9 points" (gold color)
- Button grid: flexWrap, 12px gap
- Each button:
  - Inactive: Border 2px solid border color, transparent background
  - Active: Gold (#D4AF37) background and border, white text
  - Show label + "+{points}" below
  - Padding: 12px vertical, 16px horizontal
  - Border radius: 12px
  - Min width: 100px

INTERACTIONS:
- Pressing button calls onToggle(key)

OUTPUT:
- Component code only
- Accept theme colors as props or use hardcoded dark theme

=== PROMPT END ===
```

---

# PROMPT 11: StatsPanel Component

```
=== PROMPT START ===

Create a React Native component called StatsPanel showing tracking statistics.

REQUIREMENTS:
- File location: components/tracking/StatsPanel.tsx
- Framework: React Native
- Language: TypeScript

PROPS:
interface Props {
  stats: {
    currentStreak: number
    bestStreak: number
    totalNights: number
    perfectNights: number
    totalPoints: number
    averagePoints: number
  }
}

STAT ITEMS:
const statItems = [
  { label: 'Current Streak', value: stats.currentStreak, suffix: ' nights' },
  { label: 'Best Streak', value: stats.bestStreak, suffix: ' nights' },
  { label: 'Total Nights', value: stats.totalNights, suffix: '' },
  { label: 'Perfect Nights', value: stats.perfectNights, suffix: '' },
  { label: 'Total Points', value: stats.totalPoints, suffix: '' },
  { label: 'Average', value: stats.averagePoints.toFixed(1), suffix: '' },
]

VISUAL DESIGN:
- Container: surface color, 16px border radius, 20px padding
- Title: "Statistics" (18px, bold, white)
- Grid: 3 columns, flexWrap
- Each stat:
  - Value: 20px, bold, gold (#D4AF37)
  - Label: 12px, #888888, below value
  - Centered, 12px padding vertical
- 16px margin top

OUTPUT:
- Component code only

=== PROMPT END ===
```

---

# PROMPT 12: HeatmapCalendar Component

```
=== PROMPT START ===

Create a React Native component called HeatmapCalendar - GitHub-style activity grid.

REQUIREMENTS:
- File location: components/tracking/HeatmapCalendar.tsx
- Framework: React Native
- Language: TypeScript

PROPS:
interface Props {
  records: Record<string, {
    tahajjud1: boolean
    tahajjud2: boolean
    tahajjud3: boolean
    tahajjud4: boolean
    witr: boolean
  }>
  getPoints: (record: any) => number  // Returns 0-9
}

DATA GENERATION:
- Generate last 12 weeks (84 days)
- Each week is a column (7 rows for days)
- Calculate intensity: points / 9 (0 to 1)

COLOR MAPPING:
function getColor(intensity: number): string {
  if (intensity === 0) return '#3A3A3A'  // Empty
  const alpha = 0.2 + intensity * 0.8    // 0.2 to 1.0
  return `rgba(212, 175, 55, ${alpha})`  // Gold with varying opacity
}

VISUAL DESIGN:
- Container: surface color, 16px border radius, 20px padding
- Title: "Activity" (18px, bold, 16px margin bottom)
- Grid:
  - 12 columns (weeks), 7 rows (days)
  - Each cell: 20x20px, 4px border radius, 4px gap
  - Horizontal scroll if needed
- Legend (bottom right):
  - "Less" label + 5 color squares (0, 0.25, 0.5, 0.75, 1 intensity) + "More" label
  - Legend squares: 14x14px, 3px border radius
  - 4px gap, 12px margin top

OUTPUT:
- Component code only
- Include date generation logic

=== PROMPT END ===
```

---

# PROMPT 13: ThemePicker Component

```
=== PROMPT START ===

Create a React Native component called ThemePicker for selecting app theme.

REQUIREMENTS:
- File location: components/settings/ThemePicker.tsx
- Framework: React Native
- Language: TypeScript

PROPS:
interface Props {
  currentThemeId: string
  onSelect: (themeId: string) => void
}

AVAILABLE THEMES:
const themeOptions = [
  { id: 'gold-light', label: 'Gold Light', primary: '#D4AF37' },
  { id: 'gold-dark', label: 'Gold Dark', primary: '#D4AF37' },
  { id: 'emerald-light', label: 'Emerald Light', primary: '#10B981' },
  { id: 'emerald-dark', label: 'Emerald Dark', primary: '#10B981' },
  { id: 'rose-light', label: 'Rose Light', primary: '#F43F5E' },
  { id: 'rose-dark', label: 'Rose Dark', primary: '#F43F5E' },
  { id: 'purple-light', label: 'Purple Light', primary: '#8B5CF6' },
  { id: 'purple-dark', label: 'Purple Dark', primary: '#8B5CF6' },
  { id: 'amber-light', label: 'Amber Light', primary: '#F59E0B' },
  { id: 'amber-dark', label: 'Amber Dark', primary: '#F59E0B' },
]

VISUAL DESIGN:
- Grid layout: flexWrap, 12px gap
- Each theme option:
  - Pressable container, 8px padding, 8px border radius
  - Border: 2px solid (normal: #3A3A3A, selected: theme's primary color)
  - Color preview circle: 40x40px, filled with primary color
  - Label below: 10px, #888888
- Center each option

INTERACTIONS:
- Pressing calls onSelect(themeId)

OUTPUT:
- Component code only

=== PROMPT END ===
```

---

# PROMPT 14: SettingsRow Component

```
=== PROMPT START ===

Create a React Native component called SettingsRow - a reusable settings row.

REQUIREMENTS:
- File location: components/settings/SettingsRow.tsx
- Framework: React Native
- Language: TypeScript

PROPS:
interface Props {
  label: string
  value?: string        // Optional displayed value
  onPress?: () => void  // If provided, row is pressable
  rightElement?: React.ReactNode  // Custom right element (e.g., Switch)
}

VISUAL DESIGN:
- Container: surface color (#2A2A2A), 12px border radius, 16px padding
- Horizontal layout, space-between
- Label: 16px, white
- Right side:
  - If value provided: 14px, #888888
  - If rightElement provided: render it
  - If onPress provided: show chevron ">" (14px, #666666)
- If onPress: wrap in Pressable

OUTPUT:
- Component code only

=== PROMPT END ===
```

---

## Prompt Execution Checklist

After running all prompts, verify these files exist:

- [ ] `components/ui/ArabicText.tsx`
- [ ] `components/prayer/PrayerTimeRow.tsx`
- [ ] `components/prayer/NextPrayerCountdown.tsx`
- [ ] `components/qibla/CompassDial.tsx`
- [ ] `components/qibla/QiblaArrow.tsx`
- [ ] `components/mushaf/AyahView.tsx`
- [ ] `components/mushaf/SurahHeader.tsx`
- [ ] `components/mushaf/SurahListSheet.tsx`
- [ ] `components/mushaf/BookmarksSheet.tsx`
- [ ] `components/tracking/DailyTracker.tsx`
- [ ] `components/tracking/StatsPanel.tsx`
- [ ] `components/tracking/HeatmapCalendar.tsx`
- [ ] `components/settings/ThemePicker.tsx`
- [ ] `components/settings/SettingsRow.tsx`
