import { ScrollView, StyleSheet, View, Text } from 'react-native'
import { useTheme } from '../../theme/ThemeProvider'
import { DailyTracker } from '../../components/tracking/DailyTracker'
import { StatsPanel } from '../../components/tracking/StatsPanel'
import { HeatmapCalendar } from '../../components/tracking/HeatmapCalendar'

export default function TrackingScreen() {
  const theme = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.header, { color: theme.text }]}>Night Prayers</Text>

        <DailyTracker />
        <StatsPanel />
        <HeatmapCalendar />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 100,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 32,
  },
})
