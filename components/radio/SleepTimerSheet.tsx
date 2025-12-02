import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme/ThemeProvider'
import { useAudioStore } from '../../stores/audioStore'

interface SleepTimerSheetProps {
  visible: boolean
  onClose: () => void
}

const TIMER_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '60 minutes', value: 60 },
]

export function SleepTimerSheet({ visible, onClose }: SleepTimerSheetProps) {
  const theme = useTheme()
  const { sleepTimerMinutes, setSleepTimer } = useAudioStore()

  const handleSelectTimer = (minutes: number) => {
    setSleepTimer(minutes)
    onClose()
  }

  const handleCancelTimer = () => {
    setSleepTimer(null)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.sheet, { backgroundColor: theme.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Sleep Timer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            {TIMER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  { backgroundColor: theme.background, borderColor: theme.border },
                  sleepTimerMinutes === option.value && {
                    backgroundColor: theme.primary + '20',
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => handleSelectTimer(option.value)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="timer-outline"
                  size={24}
                  color={sleepTimerMinutes === option.value ? theme.primary : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: sleepTimerMinutes === option.value ? theme.primary : theme.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            {sleepTimerMinutes !== null && (
              <TouchableOpacity
                style={[
                  styles.option,
                  styles.cancelOption,
                  { backgroundColor: theme.background, borderColor: theme.error },
                ]}
                onPress={handleCancelTimer}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle-outline" size={24} color={theme.error} />
                <Text style={[styles.optionText, { color: theme.error }]}>
                  Cancel Timer
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  options: {
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  cancelOption: {
    marginTop: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
})
