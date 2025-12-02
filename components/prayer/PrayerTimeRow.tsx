import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../theme/ThemeProvider'

interface Props {
  prayer: {
    name: string
    nameArabic: string
    time: string
    isPast: boolean
    isNext: boolean
  }
}

export function PrayerTimeRow({ prayer }: Props) {
  const theme = useTheme()
  const { name, nameArabic, time, isPast, isNext } = prayer

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.surface },
      isNext && { backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.primary }
    ]}>
      <View style={styles.leftContainer}>
        <Text style={[
          styles.name,
          { color: isPast ? theme.textMuted : theme.text }
        ]}>
          {name}
        </Text>
        <Text style={[
          styles.nameArabic,
          { color: isPast ? theme.textMuted : theme.textSecondary }
        ]}>
          {nameArabic}
        </Text>
      </View>
      <Text style={[
        styles.time,
        { color: isPast ? theme.textMuted : isNext ? theme.primary : theme.text }
      ]}>
        {time}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 4,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  nameArabic: {
    fontSize: 14,
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
  },
})
