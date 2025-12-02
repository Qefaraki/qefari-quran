import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors } from '@theme/colors';

interface Props {
  rotation: number; // Degrees to rotate (negative of device heading)
}

const CompassDial: React.FC<Props> = ({ rotation }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: withSpring(`${rotation}deg`, { damping: 50, stiffness: 100 }) }
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* North Marker */}
      <View style={[styles.marker, styles.markerNorth]} />
      
      {/* East Marker */}
      <View style={[styles.marker, styles.markerEast]} />
      
      {/* South Marker */}
      <View style={[styles.marker, styles.markerSouth]} />
      
      {/* West Marker */}
      <View style={[styles.marker, styles.markerWest]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  marker: {
    position: 'absolute',
    backgroundColor: Colors.markerGray,
  },
  markerNorth: {
    top: 0,
    width: 4,
    height: 20,
    backgroundColor: Colors.markerRed,
  },
  markerSouth: {
    bottom: 0,
    width: 4,
    height: 20,
  },
  markerEast: {
    right: 0,
    width: 20,
    height: 4,
  },
  markerWest: {
    left: 0,
    width: 20,
    height: 4,
  },
});

export default CompassDial;