import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { usePrayerStore } from '@/stores/prayerStore';
import { useLocationStore } from '@/stores/locationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Colors } from '@/theme/colors';
import PrayerTimeRow from '@/components/prayer/PrayerTimeRow';
import NextPrayerCountdown from '@/components/prayer/NextPrayerCountdown';

export default function PrayerTimesScreen() {
  const { times, city, loadPrayerTimes, refreshDisplayState, isLoading } = usePrayerStore();
  const { location, requestPermission, getCurrentLocation } = useLocationStore();
  const { useManualLocation, manualLocation } = useSettingsStore();
  const [permissionRequested, setPermissionRequested] = useState(false);

  // Request location permission on mount
  useEffect(() => {
    async function requestLocationPermission() {
      if (!permissionRequested) {
        setPermissionRequested(true);
        const granted = await requestPermission();
        if (granted) {
          await getCurrentLocation();
        }
      }
    }
    requestLocationPermission();
  }, [permissionRequested]);

  // Load prayer times when location changes
  useEffect(() => {
    if (useManualLocation && manualLocation) {
      loadPrayerTimes(manualLocation.lat, manualLocation.lon, manualLocation.city);
    } else if (location) {
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;
      loadPrayerTimes(lat, lon, city || 'Unknown');
    }
  }, [location, useManualLocation, manualLocation]);

  // Refresh display state every minute
  useEffect(() => {
    const interval = setInterval(() => {
      refreshDisplayState();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  const nextPrayer = times.find((prayer) => prayer.isNext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading prayer times...</Text>
      </View>
    );
  }

  if (times.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Unable to load prayer times</Text>
        <Text style={styles.emptySubtext}>Please check location permissions</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* City Header */}
      <View style={styles.header}>
        <Text style={styles.city}>{city || 'Unknown Location'}</Text>
      </View>

      {/* Next Prayer Countdown */}
      {nextPrayer && (
        <View style={styles.countdownContainer}>
          <NextPrayerCountdown prayer={nextPrayer} />
        </View>
      )}

      {/* Prayer Times List */}
      <View style={styles.prayerList}>
        {times.map((prayer, index) => (
          <PrayerTimeRow key={index} prayer={prayer} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  city: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  countdownContainer: {
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
