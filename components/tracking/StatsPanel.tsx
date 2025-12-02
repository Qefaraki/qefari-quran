import { View, Text, StyleSheet } from 'react-native'
import { useTrackingStore } from '../../stores/trackingStore'
import { useTheme } from '../../theme/ThemeProvider'

export function StatsPanel() {
  const theme = useTheme()
  const { getStats } = useTrackingStore()
  const stats = getStats()

  const StatItem = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: theme.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>Your Stats</Text>

      <View style={styles.statsGrid}>
        <StatItem label="Current Streak" value={`${stats.currentStreak} days`} />
        <StatItem label="Best Streak" value={`${stats.bestStreak} days`} />
        <StatItem label="Total Nights" value={stats.totalNights} />
        <StatItem label="Perfect Nights" value={stats.perfectNights} />
        <StatItem label="Total Points" value={stats.totalPoints} />
        <StatItem
          label="Average Points"
          value={stats.averagePoints.toFixed(1)}
        />
      </View>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
})
