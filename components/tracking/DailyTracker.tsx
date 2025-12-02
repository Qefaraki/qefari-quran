import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useTrackingStore, PrayerRecord } from '../../stores/trackingStore'
import { useTheme } from '../../theme/ThemeProvider'
import * as Haptics from 'expo-haptics'
import { useSettingsStore } from '../../stores/settingsStore'

export function DailyTracker() {
  const theme = useTheme()
  const { hapticsEnabled } = useSettingsStore()
  const { getRecord, togglePrayer, getPoints } = useTrackingStore()

  const today = new Date().toISOString().split('T')[0]
  const record = getRecord(today)
  const points = getPoints(record)

  const handleToggle = (prayer: keyof Omit<PrayerRecord, 'date'>) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    togglePrayer(today, prayer)
  }

  const PrayerBox = ({
    label,
    completed,
    onPress
  }: {
    label: string
    completed: boolean
    onPress: () => void
  }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.prayerBox,
        {
          backgroundColor: completed ? theme.primary : theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Text
        style={[
          styles.prayerLabel,
          { color: completed ? theme.background : theme.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Today's Prayers</Text>
        <View style={[styles.pointsBadge, { backgroundColor: theme.primary }]}>
          <Text style={[styles.pointsText, { color: theme.background }]}>
            {points} / 9
          </Text>
        </View>
      </View>

      <View style={styles.prayersGrid}>
        <PrayerBox
          label="Tahajjud 1"
          completed={record.tahajjud1}
          onPress={() => handleToggle('tahajjud1')}
        />
        <PrayerBox
          label="Tahajjud 2"
          completed={record.tahajjud2}
          onPress={() => handleToggle('tahajjud2')}
        />
        <PrayerBox
          label="Tahajjud 3"
          completed={record.tahajjud3}
          onPress={() => handleToggle('tahajjud3')}
        />
        <PrayerBox
          label="Tahajjud 4"
          completed={record.tahajjud4}
          onPress={() => handleToggle('tahajjud4')}
        />
      </View>

      <View style={styles.witrContainer}>
        <PrayerBox
          label="Witr"
          completed={record.witr}
          onPress={() => handleToggle('witr')}
        />
      </View>

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Tap to mark prayers complete
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  prayersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  witrContainer: {
    marginBottom: 12,
  },
  prayerBox: {
    flex: 1,
    minWidth: '47%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
})
