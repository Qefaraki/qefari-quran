import { View, Text, StyleSheet, FlatList } from 'react-native'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import { useTheme } from '../../theme/ThemeProvider'
import { useAudioStore, Reciter } from '../../stores/audioStore'
import { ReciterCard } from '../../components/radio/ReciterCard'
import { NowPlayingBar } from '../../components/radio/NowPlayingBar'
import { SleepTimerSheet } from '../../components/radio/SleepTimerSheet'

export default function RadioScreen() {
  const theme = useTheme()
  const {
    reciters,
    currentReciter,
    isPlaying,
    downloadProgress,
    sleepTimerEndTime,
    play,
    pause,
    downloadReciter,
    isReciterAvailable,
  } = useAudioStore()

  const [showSleepTimer, setShowSleepTimer] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)

  useEffect(() => {
    if (!sleepTimerEndTime) {
      setTimeRemaining(null)
      return
    }

    const interval = setInterval(() => {
      const now = new Date()
      const end = new Date(sleepTimerEndTime)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining(null)
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [sleepTimerEndTime])

  const handleReciterPress = async (reciter: Reciter) => {
    const available = isReciterAvailable(reciter.id)

    if (!available) {
      // Start download
      await downloadReciter(reciter.id)
    } else if (currentReciter?.id === reciter.id) {
      // Toggle play/pause for current reciter
      if (isPlaying) {
        await pause()
      } else {
        await play(reciter)
      }
    } else {
      // Play different reciter
      await play(reciter)
    }
  }

  const renderReciter = ({ item }: { item: Reciter }) => {
    const isCurrentReciter = currentReciter?.id === item.id
    const progress = downloadProgress[item.id]

    return (
      <ReciterCard
        reciter={item}
        isPlaying={isPlaying && isCurrentReciter}
        isCurrentReciter={isCurrentReciter}
        downloadProgress={progress}
        onPress={() => handleReciterPress(item)}
      />
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Quran Radio</Text>
          {timeRemaining && (
            <Text style={[styles.timerText, { color: theme.primary }]}>
              Sleep timer: {timeRemaining}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.timerButton, { backgroundColor: theme.surface }]}
          onPress={() => setShowSleepTimer(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="timer-outline"
            size={24}
            color={sleepTimerEndTime ? theme.primary : theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reciters}
        keyExtractor={(item) => item.id}
        renderItem={renderReciter}
        contentContainerStyle={[
          styles.listContent,
          currentReciter && styles.listContentWithPlayer,
        ]}
        showsVerticalScrollIndicator={false}
      />

      <NowPlayingBar />

      <SleepTimerSheet
        visible={showSleepTimer}
        onClose={() => setShowSleepTimer(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  timerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  listContentWithPlayer: {
    paddingBottom: 100,
  },
})
