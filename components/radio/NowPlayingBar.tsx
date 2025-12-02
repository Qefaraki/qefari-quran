import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme/ThemeProvider'
import { useAudioStore } from '../../stores/audioStore'

export function NowPlayingBar() {
  const theme = useTheme()
  const { currentReciter, isPlaying, pause, play, stop } = useAudioStore()

  if (!currentReciter) return null

  const handlePlayPause = async () => {
    if (isPlaying) {
      await pause()
    } else {
      await play(currentReciter)
    }
  }

  const handleStop = async () => {
    await stop()
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceElevated, borderTopColor: theme.border }]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Now Playing</Text>
          <Text style={[styles.reciterName, { color: theme.text }]} numberOfLines={1}>
            {currentReciter.nameArabic}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.surface }]}
            onPress={handlePlayPause}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.surface }]}
            onPress={handleStop}
            activeOpacity={0.7}
          >
            <Ionicons name="stop" size={24} color={theme.error} />
          </TouchableOpacity>
        </View>
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
    borderTopWidth: 1,
    paddingBottom: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 2,
  },
  reciterName: {
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
