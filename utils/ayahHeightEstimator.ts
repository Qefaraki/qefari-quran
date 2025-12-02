import { Ayah } from '../data/quranLoader'

const BASE_HEIGHT = 60
const LINE_HEIGHT = 50        // Matches Arabic font lineHeight
const PADDING = 32            // 16px top + 16px bottom
const SURAH_HEADER_HEIGHT = 120

/**
 * Estimates ayah height based on text length and font size.
 * More accurate than fixed estimatedItemSize for variable Arabic text.
 */
export function estimateAyahHeight(ayah: Ayah, fontSize: number = 28, lineSpacing: number = 16): number {
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
