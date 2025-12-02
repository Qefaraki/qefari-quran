import React from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useTheme } from '../../theme/ThemeProvider'

interface Props {
  rotation: number
}

export function CompassDial({ rotation }: Props) {
  const theme = useTheme()

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: withSpring(`${rotation}deg`, { damping: 50, stiffness: 100 }) }
      ],
    }
  })

  return (
    <Animated.View style={[styles.container, { borderColor: theme.border }, animatedStyle]}>
      <View style={[styles.marker, styles.markerNorth, { backgroundColor: theme.error }]} />
      <View style={[styles.marker, styles.markerEast, { backgroundColor: theme.textMuted }]} />
      <View style={[styles.marker, styles.markerSouth, { backgroundColor: theme.textMuted }]} />
      <View style={[styles.marker, styles.markerWest, { backgroundColor: theme.textMuted }]} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  marker: {
    position: 'absolute',
  },
  markerNorth: {
    top: 0,
    width: 4,
    height: 20,
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
})
