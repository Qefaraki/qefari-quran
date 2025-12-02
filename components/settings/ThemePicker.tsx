import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useSettingsStore } from '../../stores/settingsStore'
import { useTheme } from '../../theme/ThemeProvider'
import { themes, ThemeId } from '../../theme/colors'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

const themeOptions: { id: ThemeId; name: string; color: string; mode: 'light' | 'dark' }[] = [
  { id: 'gold-light', name: 'Gold', color: '#D4AF37', mode: 'light' },
  { id: 'gold-dark', name: 'Gold', color: '#D4AF37', mode: 'dark' },
  { id: 'emerald-light', name: 'Emerald', color: '#10B981', mode: 'light' },
  { id: 'emerald-dark', name: 'Emerald', color: '#10B981', mode: 'dark' },
  { id: 'rose-light', name: 'Rose', color: '#F43F5E', mode: 'light' },
  { id: 'rose-dark', name: 'Rose', color: '#F43F5E', mode: 'dark' },
  { id: 'purple-light', name: 'Purple', color: '#A855F7', mode: 'light' },
  { id: 'purple-dark', name: 'Purple', color: '#A855F7', mode: 'dark' },
  { id: 'amber-light', name: 'Amber', color: '#F59E0B', mode: 'light' },
  { id: 'amber-dark', name: 'Amber', color: '#F59E0B', mode: 'dark' },
]

export function ThemePicker() {
  const theme = useTheme()
  const { themeId, setTheme, hapticsEnabled } = useSettingsStore()

  const handleThemeSelect = (id: ThemeId) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    setTheme(id)
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Theme</Text>

      <View style={styles.grid}>
        {themeOptions.map((option) => {
          const isSelected = themeId === option.id

          return (
            <Pressable
              key={option.id}
              onPress={() => handleThemeSelect(option.id)}
              style={[
                styles.themeCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: isSelected ? theme.primary : theme.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: option.color,
                  },
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                )}
              </View>
              <Text style={[styles.themeName, { color: theme.text }]}>
                {option.name}
              </Text>
              <Text style={[styles.themeMode, { color: theme.textSecondary }]}>
                {option.mode === 'light' ? 'Light' : 'Dark'}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '31%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeMode: {
    fontSize: 12,
  },
})
