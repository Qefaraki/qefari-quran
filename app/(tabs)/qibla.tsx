import React, { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useCompassHeading } from '../../hooks/useCompassHeading'
import { useLocationStore } from '../../stores/locationStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useTheme } from '../../theme/ThemeProvider'
import { CompassDial } from '../../components/qibla/CompassDial'
import { QiblaArrow } from '../../components/qibla/QiblaArrow'
import { calculateQiblaDirection, getDirectionText, isAligned } from '../../services/qiblaCalculation'

export default function QiblaScreen() {
  const theme = useTheme()
  const { heading, hasPermission, error } = useCompassHeading()
  const { location, getCurrentLocation } = useLocationStore()
  const { useManualLocation, manualLocation, hapticsEnabled } = useSettingsStore()
  const [qiblaDirection, setQiblaDirection] = useState<number>(0)
  const [directionText, setDirectionText] = useState<string>('')
  const [degreeFromNorth, setDegreeFromNorth] = useState<number>(0)
  const wasAlignedRef = useRef(false)

  useEffect(() => {
    if (!location && !useManualLocation) {
      getCurrentLocation()
    }
  }, [])

  useEffect(() => {
    let lat: number
    let lon: number

    if (useManualLocation && manualLocation) {
      lat = manualLocation.lat
      lon = manualLocation.lon
    } else if (location) {
      lat = location.coords.latitude
      lon = location.coords.longitude
    } else {
      return
    }

    const direction = calculateQiblaDirection(lat, lon)
    setQiblaDirection(direction)
    setDegreeFromNorth(Math.round(direction))
  }, [location, useManualLocation, manualLocation])

  useEffect(() => {
    const angleDiff = Math.abs(qiblaDirection - heading)
    const normalizedDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff

    const text = getDirectionText(normalizedDiff)
    setDirectionText(text)

    const aligned = isAligned(normalizedDiff)
    if (aligned && !wasAlignedRef.current && hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      wasAlignedRef.current = true
    } else if (!aligned && wasAlignedRef.current) {
      wasAlignedRef.current = false
    }
  }, [heading, qiblaDirection, hapticsEnabled])

  if (error || !hasPermission) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>Location permission required</Text>
        <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>Please enable location services</Text>
      </View>
    )
  }

  if (!location && !manualLocation) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Waiting for location...</Text>
      </View>
    )
  }

  const compassRotation = -heading
  const arrowRotation = qiblaDirection - heading

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Qibla Direction</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{degreeFromNorth}° from North</Text>
      </View>

      <View style={styles.compassContainer}>
        <CompassDial rotation={compassRotation} />
        <View style={styles.arrowContainer}>
          <QiblaArrow rotation={arrowRotation} />
        </View>
      </View>

      <View style={styles.directionContainer}>
        <Text style={[
          styles.directionText,
          { color: isAligned(Math.abs(qiblaDirection - heading)) ? theme.success : theme.text }
        ]}>
          {directionText}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textMuted }]}>Current heading: {Math.round(heading)}°</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: 'space-around',
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  arrowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  directionText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
  },
  errorSubtext: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
})
