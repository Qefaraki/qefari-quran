import { Stack, router } from 'expo-router'
import { useEffect } from 'react'
import { useFonts } from 'expo-font'
import { Pressable } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { Ionicons } from '@expo/vector-icons'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'KFGQPCHAFSUthmanicScript': require('../assets/fonts/KFGQPCHAFSUthmanicScript.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/settings')}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="settings-outline" size={24} color="#D4AF37" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'modal',
          headerTitle: 'Settings',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#FFFFFF',
        }}
      />
    </Stack>
  )
}
