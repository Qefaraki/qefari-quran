import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useCompassHeading } from '@/hooks/useCompassHeading';
import { useLocationStore } from '@/stores/locationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Colors } from '@/theme/colors';
import CompassDial from '@/components/qibla/CompassDial';
import QiblaArrow from '@/components/qibla/QiblaArrow';
import { calculateQiblaDirection, getDirectionText, isAligned } from '@/services/qiblaCalculation';

export default function QiblaScreen() {
  const { heading, hasPermission, error } = useCompassHeading();
  const { location, getCurrentLocation } = useLocationStore();
  const { useManualLocation, manualLocation, hapticsEnabled } = useSettingsStore();
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [directionText, setDirectionText] = useState<string>('');
  const [degreeFromNorth, setDegreeFromNorth] = useState<number>(0);
  const wasAlignedRef = useRef(false);

  // Get location on mount
  useEffect(() => {
    if (!location && !useManualLocation) {
      getCurrentLocation();
    }
  }, []);

  // Calculate Qibla direction when location changes
  useEffect(() => {
    let lat: number;
    let lon: number;

    if (useManualLocation && manualLocation) {
      lat = manualLocation.lat;
      lon = manualLocation.lon;
    } else if (location) {
      lat = location.coords.latitude;
      lon = location.coords.longitude;
    } else {
      return;
    }

    const direction = calculateQiblaDirection(lat, lon);
    setQiblaDirection(direction);
    setDegreeFromNorth(Math.round(direction));
  }, [location, useManualLocation, manualLocation]);

  // Update direction text and handle haptic feedback
  useEffect(() => {
    const angleDiff = Math.abs(qiblaDirection - heading);
    const normalizedDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff;

    const text = getDirectionText(normalizedDiff);
    setDirectionText(text);

    // Trigger haptic feedback when aligned
    const aligned = isAligned(normalizedDiff);
    if (aligned && !wasAlignedRef.current && hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      wasAlignedRef.current = true;
    } else if (!aligned && wasAlignedRef.current) {
      wasAlignedRef.current = false;
    }
  }, [heading, qiblaDirection, hapticsEnabled]);

  if (error || !hasPermission) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Location permission required</Text>
        <Text style={styles.errorSubtext}>Please enable location services</Text>
      </View>
    );
  }

  if (!location && !manualLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Waiting for location...</Text>
      </View>
    );
  }

  // Calculate rotations
  const compassRotation = -heading; // Rotate compass opposite to heading
  const arrowRotation = qiblaDirection - heading; // Arrow points to Qibla

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Qibla Direction</Text>
        <Text style={styles.subtitle}>{degreeFromNorth} from North</Text>
      </View>

      {/* Compass Display */}
      <View style={styles.compassContainer}>
        <CompassDial rotation={compassRotation} />
        <View style={styles.arrowContainer}>
          <QiblaArrow rotation={arrowRotation} />
        </View>
      </View>

      {/* Direction Text */}
      <View style={styles.directionContainer}>
        <Text style={[
          styles.directionText,
          isAligned(Math.abs(qiblaDirection - heading)) && styles.directionTextAligned
        ]}>
          {directionText}
        </Text>
      </View>

      {/* Heading Display */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Current heading: {Math.round(heading)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: 'space-around',
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
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
    color: Colors.text,
  },
  directionTextAligned: {
    color: Colors.success,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    fontWeight: '500',
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
