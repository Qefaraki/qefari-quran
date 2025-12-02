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

/**
 * Get total ayah count
 */
export function getTotalAyahCount(): number {
  return getQuranData().ayahs.length
}

/**
 * Get all surahs
 */
export function getAllSurahs(): Surah[] {
  return getQuranData().surahs
}
