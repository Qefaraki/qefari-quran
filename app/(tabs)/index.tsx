import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { usePrayerStore } from '../../stores/prayerStore'
import { useLocationStore } from '../../stores/locationStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useTheme } from '../../theme/ThemeProvider'
import { PrayerTimeRow } from '../../components/prayer/PrayerTimeRow'
import { NextPrayerCountdown } from '../../components/prayer/NextPrayerCountdown'

export default function PrayerTimesScreen() {
  const theme = useTheme()
  const { times, city, loadPrayerTimes, refreshDisplayState, isLoading } = usePrayerStore()
  const { location, requestPermission, getCurrentLocation } = useLocationStore()
  const { useManualLocation, manualLocation } = useSettingsStore()
  const [permissionRequested, setPermissionRequested] = useState(false)

  useEffect(() => {
    async function requestLocationPermission() {
      if (!permissionRequested) {
        setPermissionRequested(true)
        const granted = await requestPermission()
        if (granted) {
          await getCurrentLocation()
        }
      }
    }
    requestLocationPermission()
  }, [permissionRequested])

  useEffect(() => {
    if (useManualLocation && manualLocation) {
      loadPrayerTimes(manualLocation.lat, manualLocation.lon, manualLocation.city)
    } else if (location) {
      const lat = location.coords.latitude
      const lon = location.coords.longitude
      loadPrayerTimes(lat, lon, city || 'Unknown')
    }
  }, [location, useManualLocation, manualLocation])

  useEffect(() => {
    const interval = setInterval(() => {
      refreshDisplayState()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const nextPrayer = times.find((prayer) => prayer.isNext)

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading prayer times...</Text>
      </View>
    )
  }

  if (times.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.emptyText, { color: theme.text }]}>Unable to load prayer times</Text>
        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Please check location permissions</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={[styles.city, { color: theme.text }]}>{city || 'Unknown Location'}</Text>
      </View>

      {nextPrayer && (
        <View style={[styles.countdownContainer, { backgroundColor: theme.surface }]}>
          <NextPrayerCountdown prayer={nextPrayer} />
        </View>
      )}

      <View style={styles.prayerList}>
        {times.map((prayer, index) => (
          <PrayerTimeRow key={index} prayer={prayer} />
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  city: {
    fontSize: 20,
    fontWeight: '600',
  },
  countdownContainer: {
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
  },
  prayerList: {
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
  },
})
