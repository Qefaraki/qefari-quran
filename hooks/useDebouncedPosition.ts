import { useRef, useCallback, useEffect } from 'react'
import { useMushafStore } from '../stores/mushafStore'

/**
 * Debounces position updates to reduce MMKV writes during scrolling.
 * Only saves position after user stops scrolling for `delay` ms.
 */
export function useDebouncedPosition(delay = 500) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPositionRef = useRef<number>(0)
  const { updatePosition } = useMushafStore()

  const debouncedUpdate = useCallback((globalIndex: number) => {
    // Skip if same position
    if (globalIndex === lastPositionRef.current) return
    lastPositionRef.current = globalIndex

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce write to storage
    timeoutRef.current = setTimeout(() => {
      updatePosition(globalIndex)
    }, delay)
  }, [updatePosition, delay])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedUpdate
}
