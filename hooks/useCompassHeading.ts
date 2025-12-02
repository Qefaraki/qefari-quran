import { useState, useEffect } from 'react'
import * as Location from 'expo-location'

export function useCompassHeading() {
  const [heading, setHeading] = useState(0)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null

    async function start() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          setHasPermission(false)
          setError('Location permission denied')
          return
        }
        setHasPermission(true)

        subscription = await Location.watchHeadingAsync((data) => {
          setHeading(data.magHeading)
        })
      } catch (e) {
        setError('Failed to start compass')
      }
    }

    start()

    return () => {
      subscription?.remove()
    }
  }, [])

  return { heading, hasPermission, error }
}
