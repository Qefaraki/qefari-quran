import React from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useTheme } from '../../theme/ThemeProvider'

interface Props {
  rotation: number
}

export function QiblaArrow({ rotation }: Props) {
  const theme = useTheme()

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: withSpring(`${rotation}deg`, { damping: 15 }) }
      ],
    }
  })

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.arrowHead, { borderBottomColor: theme.primary }]} />
      <View style={[styles.kaabaIcon, { backgroundColor: theme.background, borderColor: theme.primary }]} />
    </Animated.View>
  )
}

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
  },
  kaabaIcon: {
    position: 'absolute',
    top: -12,
    width: 24,
    height: 24,
    borderWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
})
