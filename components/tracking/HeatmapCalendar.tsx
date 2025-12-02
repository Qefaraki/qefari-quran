import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useTrackingStore } from '../../stores/trackingStore'
import { useTheme } from '../../theme/ThemeProvider'
import { useMemo } from 'react'

export function HeatmapCalendar() {
  const theme = useTheme()
  const { records, getPoints } = useTrackingStore()

  // Generate last 12 weeks of dates
  const weeks = useMemo(() => {
    const result: string[][] = []
    const today = new Date()

    for (let week = 11; week >= 0; week--) {
      const weekDates: string[] = []
      for (let day = 6; day >= 0; day--) {
        const date = new Date(today)
        date.setDate(date.getDate() - (week * 7 + day))
        weekDates.unshift(date.toISOString().split('T')[0])
      }
      result.push(weekDates)
    }

    return result
  }, [])

  const getColorForPoints = (points: number): string => {
    if (points === 0) return theme.surface
    if (points <= 3) return theme.primary + '33' // 20% opacity
    if (points <= 6) return theme.primary + '66' // 40% opacity
    if (points <= 8) return theme.primary + 'AA' // 67% opacity
    return theme.primary // 100% opacity
  }

  const DayCell = ({ date }: { date: string }) => {
    const record = records[date]
    const points = record ? getPoints(record) : 0
    const color = getColorForPoints(points)

    return (
      <View
        style={[
          styles.dayCell,
          {
            backgroundColor: color,
            borderColor: theme.border,
          },
        ]}
      />
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>Prayer History</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.heatmap}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {week.map((date) => (
                <DayCell key={date} date={date} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: theme.textSecondary }]}>Less</Text>
        <View style={styles.legendBoxes}>
          <View style={[styles.legendBox, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]} />
          <View style={[styles.legendBox, { backgroundColor: theme.primary + '33' }]} />
          <View style={[styles.legendBox, { backgroundColor: theme.primary + '66' }]} />
          <View style={[styles.legendBox, { backgroundColor: theme.primary + 'AA' }]} />
          <View style={[styles.legendBox, { backgroundColor: theme.primary }]} />
        </View>
        <Text style={[styles.legendText, { color: theme.textSecondary }]}>More</Text>
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
  heatmap: {
    flexDirection: 'row',
    gap: 3,
  },
  week: {
    gap: 3,
  },
  dayCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  legendText: {
    fontSize: 12,
  },
  legendBoxes: {
    flexDirection: 'row',
    gap: 3,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
})
