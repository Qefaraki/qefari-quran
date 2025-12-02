import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../theme/ThemeProvider'

interface Props {
  prayer: {
    name: string
    date: Date
  }
}

export function NextPrayerCountdown({ prayer }: Props) {
  const theme = useTheme()
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const diff = prayer.date.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Now')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [prayer.date])

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Next: {prayer.name}</Text>
      <Text style={[styles.countdown, { color: theme.primary }]}>{timeLeft}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  countdown: {
    fontSize: 48,
    fontWeight: 'bold',
  },
})
