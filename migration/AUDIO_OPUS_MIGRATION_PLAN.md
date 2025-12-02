# Audio Format Migration Plan: MP3 to Opus/AAC

## Executive Summary

**Goal**: Reduce audio storage footprint for 13 Quran reciters (8 bundled + 5 downloadable)

**Current State**:
- Bundled: ~130 MB (8 reciters)
- Downloadable: ~1.36 GB (5 reciters)
- Total: ~1.49 GB in MP3 format

**Recommendation**: Use **AAC (M4A)** instead of Opus due to Expo compatibility issues

---

## Current Audio Inventory

### Bundled Reciters (in app binary)

| Reciter | Arabic Name | File Size |
|---------|-------------|-----------|
| maher | ماهر المعيقلي | 8.2 MB |
| ali_jaber | علي جابر | 29 MB |
| ahmad_taleb | أحمد طالب بن حميد | 9.4 MB |
| qaraawi | عبدالله القرعاوي | 10 MB |
| souilass | يونس اسويلص | 16 MB |
| aidan | عبدالعزيز العيدان | 33 MB |
| najdiyyah | النجدية | 18 MB |
| humaidi | عبدالعزيز الحميدي | 7.0 MB |
| **Total** | | **~130 MB** |

### Downloadable Reciters (GitHub releases)

| Reciter | Arabic Name | File Size |
|---------|-------------|-----------|
| yasser | ياسر الدوسري | 354 MB |
| shuraim | سعود الشريم | 251 MB |
| sudais | عبدالرحمن السديس | 291 MB |
| ghamdi | سعد الغامدي | 340 MB |
| aldamkh | عبدالعزيز الدمخ | 126 MB |
| **Total** | | **~1.36 GB** |

---

## Format Comparison

### Opus vs AAC vs MP3

| Metric | MP3 (current) | Opus | AAC (M4A) |
|--------|---------------|------|-----------|
| Bitrate for good voice | 64 kbps | 32 kbps | 48 kbps |
| Quality | Baseline | Excellent | Very Good |
| iOS Native Support | Yes | **NO** (CAF only) | Yes |
| Android Native Support | Yes | Yes (OGG) | Yes |
| expo-audio Support | Yes | **NO** | Yes |
| expo-av Support | Yes | **NO** | Yes |
| File Extension | .mp3 | .opus | .m4a |

### Size Projections

| Format | Bundled | Downloadable | Total | Savings |
|--------|---------|--------------|-------|---------|
| MP3 64kbps (current) | 130 MB | 1,360 MB | 1,490 MB | — |
| **Opus 32kbps** | 65 MB | 680 MB | 745 MB | **50%** |
| **AAC 48kbps** | 97 MB | 1,020 MB | 1,117 MB | **25%** |
| AAC 32kbps | 65 MB | 680 MB | 745 MB | 50% |

---

## Critical Finding: Opus Won't Work in Expo

### Why Opus Fails

1. **expo-audio**: Does NOT support Opus playback
2. **expo-av**: Does NOT support Opus playback
3. **iOS AVPlayer**: Cannot play `.opus` or `.ogg` files
4. **iOS 17+ limitation**: Opus ONLY works in CAF/MP4/MOV containers (not standard Opus)
5. **Workaround required**: Would need to eject from Expo and add native modules

### What Would Be Required for Opus

```
❌ Eject from Expo managed workflow
❌ Install react-native-audio-api (native module)
❌ Maintain separate iOS (CAF) and Android (OGG) containers
❌ Custom native code for each platform
❌ Lose OTA updates for audio-related changes
```

**Verdict**: Not worth the complexity for 25% extra savings over AAC.

---

## Recommended Solution: AAC (M4A)

### Why AAC

1. **Universal support**: iOS 4+, Android 4+
2. **Expo compatible**: Works with expo-audio out of the box
3. **Excellent quality**: 48 kbps AAC ≈ 96-128 kbps MP3
4. **Same infrastructure**: No container format differences
5. **Future-proof**: Industry standard, will never lose support

### Conversion Strategy

**Target**: 48 kbps AAC (optimal quality/size for voice)

```bash
# Single file conversion
ffmpeg -i input.mp3 -c:a aac -b:a 48k -movflags +faststart output.m4a

# Batch conversion (all MP3s in directory)
for f in *.mp3; do
  ffmpeg -i "$f" -c:a aac -b:a 48k -movflags +faststart "${f%.mp3}.m4a"
done
```

**Parameters explained**:
- `-c:a aac`: Use AAC codec
- `-b:a 48k`: 48 kbps bitrate (excellent for voice)
- `-movflags +faststart`: Optimize for streaming (metadata at start)

---

## Migration Plan

### Phase 1: Convert Bundled Audio

**Location**: `QefariQibla/Resources/Audio/`

```bash
#!/bin/bash
# convert_bundled.sh

INPUT_DIR="/Users/alqefari/Desktop/qiyam-swift/QefariQibla/Resources/Audio"
OUTPUT_DIR="/Users/alqefari/Desktop/qefari-quran/assets/audio"

mkdir -p "$OUTPUT_DIR"

for f in "$INPUT_DIR"/*.mp3; do
  filename=$(basename "$f" .mp3)
  echo "Converting $filename..."
  ffmpeg -i "$f" -c:a aac -b:a 48k -movflags +faststart "$OUTPUT_DIR/$filename.m4a"
done

echo "Done! Converted files in $OUTPUT_DIR"
```

**Expected results**:

| File | MP3 Size | M4A Size | Savings |
|------|----------|----------|---------|
| maher.mp3 | 8.2 MB | ~6.1 MB | 26% |
| ali_jaber.mp3 | 29 MB | ~21.8 MB | 25% |
| ahmad_taleb.mp3 | 9.4 MB | ~7.1 MB | 25% |
| qaraawi.mp3 | 10 MB | ~7.5 MB | 25% |
| souilass.mp3 | 16 MB | ~12 MB | 25% |
| aidan.mp3 | 33 MB | ~24.8 MB | 25% |
| najdiyyah.mp3 | 18 MB | ~13.5 MB | 25% |
| humaidi.mp3 | 7.0 MB | ~5.3 MB | 24% |
| **Total** | **130 MB** | **~98 MB** | **~25%** |

### Phase 2: Convert Downloadable Audio

**Source**: GitHub releases (quran-audio-assets)

```bash
#!/bin/bash
# convert_downloadable.sh

RECITERS=("yasser" "shuraim" "sudais" "ghamdi" "aldamkh")
INPUT_DIR="/tmp/quran-mp3"
OUTPUT_DIR="/tmp/quran-m4a"

mkdir -p "$INPUT_DIR" "$OUTPUT_DIR"

for reciter in "${RECITERS[@]}"; do
  echo "Downloading $reciter.mp3..."
  curl -L -o "$INPUT_DIR/$reciter.mp3" \
    "https://github.com/Qefaraki/quran-audio-assets/releases/download/audio-v1/$reciter.mp3"

  echo "Converting $reciter to M4A..."
  ffmpeg -i "$INPUT_DIR/$reciter.mp3" -c:a aac -b:a 48k -movflags +faststart "$OUTPUT_DIR/$reciter.m4a"

  # Show size comparison
  mp3_size=$(ls -lh "$INPUT_DIR/$reciter.mp3" | awk '{print $5}')
  m4a_size=$(ls -lh "$OUTPUT_DIR/$reciter.m4a" | awk '{print $5}')
  echo "  $reciter: MP3=$mp3_size -> M4A=$m4a_size"
done
```

**Expected results**:

| File | MP3 Size | M4A Size | Savings |
|------|----------|----------|---------|
| yasser.mp3 | 354 MB | ~266 MB | 25% |
| shuraim.mp3 | 251 MB | ~188 MB | 25% |
| sudais.mp3 | 291 MB | ~218 MB | 25% |
| ghamdi.mp3 | 340 MB | ~255 MB | 25% |
| aldamkh.mp3 | 126 MB | ~95 MB | 25% |
| **Total** | **1.36 GB** | **~1.02 GB** | **~25%** |

### Phase 3: Update GitHub Releases

1. Create new release tag: `audio-v2`
2. Upload all `.m4a` files
3. Update download URLs in code

```typescript
// stores/audioStore.ts - Update URLs
const AUDIO_BASE_URL = 'https://github.com/Qefaraki/quran-audio-assets/releases/download/audio-v2/'

// Change file extension
getDownloadUrl: (reciterId: string) => `${AUDIO_BASE_URL}${reciterId}.m4a`
```

### Phase 4: Update Code References

**React Native (Expo) changes**:

```typescript
// data/reciters.ts
export const BUNDLED_RECITERS = [
  { id: 'maher', file: require('../assets/audio/maher.m4a') },
  { id: 'ali_jaber', file: require('../assets/audio/ali_jaber.m4a') },
  // ... etc
]

// Or with expo-asset
import { Asset } from 'expo-asset'

const audioAssets = {
  maher: Asset.fromModule(require('../assets/audio/maher.m4a')),
  // ...
}
```

**Swift (if keeping iOS app)**:

```swift
// RadioModels.swift - Update file names
case maher = "maher"  // Looks for maher.m4a in bundle

// AudioManager.swift - Update extension
let audioExtension = "m4a"  // Change from "mp3"
```

---

## Quality Validation

### Before Deployment, Test:

1. **Playback quality**: Listen to converted files on both iOS and Android
2. **Seek accuracy**: Ensure random seek still works smoothly
3. **Loop continuity**: Verify seamless looping behavior
4. **Sleep timer**: Confirm timer still functions correctly
5. **Background playback**: Test lock screen controls

### A/B Comparison Script

```bash
#!/bin/bash
# Compare quality by listening
# Play 30 seconds from same position in both files

MP3_FILE="maher.mp3"
M4A_FILE="maher.m4a"
START_TIME="00:30:00"

echo "Playing MP3..."
ffplay -ss $START_TIME -t 30 -autoexit "$MP3_FILE"

echo "Playing M4A..."
ffplay -ss $START_TIME -t 30 -autoexit "$M4A_FILE"
```

---

## Alternative: Aggressive Compression (32 kbps)

If 25% savings isn't enough, consider 32 kbps AAC:

```bash
ffmpeg -i input.mp3 -c:a aac -b:a 32k -movflags +faststart output.m4a
```

**Trade-offs**:
- **50% file size reduction** (same as Opus)
- Slightly lower quality (still good for voice)
- May notice compression artifacts on high-end headphones

**Size comparison**:

| Compression | Bundled | Downloadable | Total |
|-------------|---------|--------------|-------|
| AAC 48 kbps | 98 MB | 1,020 MB | 1,118 MB |
| AAC 32 kbps | 65 MB | 680 MB | 745 MB |
| Savings | -33% | -33% | -33% more |

---

## If Opus Is Absolutely Required

For reference only - NOT recommended for Expo:

### Option A: Eject and Use Native Modules

1. Eject from Expo: `npx expo prebuild`
2. Install: `npm install react-native-audio-api`
3. Link native modules
4. Handle platform differences (CAF for iOS, OGG for Android)

### Option B: Two-Format Strategy

Serve different formats per platform:
- iOS: AAC (M4A)
- Android: Opus (OGG)

```typescript
import { Platform } from 'react-native'

const audioExtension = Platform.OS === 'ios' ? 'm4a' : 'opus'
const audioUrl = `${BASE_URL}/${reciterId}.${audioExtension}`
```

**Downsides**:
- Double the storage on GitHub (both formats)
- More complex download logic
- Only saves space on Android downloads

---

## Summary

| Approach | Savings | Complexity | Recommendation |
|----------|---------|------------|----------------|
| **AAC 48 kbps** | 25% | Low | **Recommended** |
| AAC 32 kbps | 50% | Low | Alternative |
| Opus (eject) | 50% | Very High | Not recommended |
| Two-format | 25-50% | High | Not recommended |

**Final Recommendation**: Convert all audio to **AAC at 48 kbps**

- Saves ~370 MB total (1.49 GB → 1.12 GB)
- Zero code complexity
- Works out of the box with expo-audio
- Maintains excellent voice quality

---

## Quick Start Commands

```bash
# 1. Install ffmpeg if needed
brew install ffmpeg

# 2. Convert bundled audio
cd /Users/alqefari/Desktop/qiyam-swift/QefariQibla/Resources/Audio
mkdir -p /Users/alqefari/Desktop/qefari-quran/assets/audio
for f in *.mp3; do
  ffmpeg -i "$f" -c:a aac -b:a 48k -movflags +faststart \
    "/Users/alqefari/Desktop/qefari-quran/assets/audio/${f%.mp3}.m4a"
done

# 3. Verify sizes
ls -lh /Users/alqefari/Desktop/qefari-quran/assets/audio/
```

---

## Next Steps

1. [ ] Run conversion script for bundled audio
2. [ ] Test playback quality on device
3. [ ] Download and convert downloadable reciters
4. [ ] Create new GitHub release (audio-v2)
5. [ ] Update code references (file extensions)
6. [ ] Update DETAILED_TASKS.md with new audio format
7. [ ] Remove old MP3 files from bundle
