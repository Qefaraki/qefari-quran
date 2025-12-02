import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@theme/colors';

interface Props {
  prayer: {
    name: string;        // "Fajr", "Dhuhr", etc.
    nameArabic: string;  // "الفجر", "الظهر", etc.
    time: string;        // "05:23" format
    isPast: boolean;     // true if prayer time has passed
    isNext: boolean;     // true if this is the next prayer
  };
}

const PrayerTimeRow: React.FC<Props> = ({ prayer }) => {
  const { name, nameArabic, time, isPast, isNext } = prayer;

  return (
    <View style={[
      styles.container,
      isNext && styles.nextContainer
    ]}>
      <View style={styles.leftContainer}>
        <Text style={[
          styles.name,
          isPast && styles.dimmedText
        ]}>
          {name}
        </Text>
        <Text style={[
          styles.nameArabic,
          isPast && styles.dimmedText
        ]}>
          {nameArabic}
        </Text>
      </View>
      <Text style={[
        styles.time,
        isPast && styles.dimmedText,
        isNext && styles.nextTime
      ]}>
        {time}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 4,
  },
  nextContainer: {
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  name: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  nameArabic: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  time: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: 'bold',
  },
  dimmedText: {
    color: Colors.textTertiary,
  },
  nextTime: {
    color: Colors.primary,
  },
});

export default PrayerTimeRow;