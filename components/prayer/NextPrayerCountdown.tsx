import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@theme/colors';

interface Props {
  prayer: {
    name: string;
    date: Date;
  };
}

const NextPrayerCountdown: React.FC<Props> = ({ prayer }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = prayer.date.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Now');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [prayer.date]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Next: {prayer.name}</Text>
      <Text style={styles.countdown}>{timeLeft}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  countdown: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default NextPrayerCountdown;