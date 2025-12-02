import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors } from '@theme/colors';

interface Props {
  rotation: number; // Degrees (qiblaDirection - heading)
}

const QiblaArrow: React.FC<Props> = ({ rotation }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: withSpring(`${rotation}deg`, { damping: 15 }) }
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Arrow Head (Triangle) */}
      <View style={styles.arrowHead} />
      
      {/* Kaaba Icon at Tip */}
      <View style={styles.kaabaIcon} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 100,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primary,
  },
  kaabaIcon: {
    position: 'absolute',
    top: -12, // Position at the tip
    width: 24,
    height: 24,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    transform: [{ rotate: '45deg' }], // Diamond shape or just square
  },
});

export default QiblaArrow;