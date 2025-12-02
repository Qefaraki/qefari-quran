import { ScrollView, StyleSheet, View, Text, Switch, Pressable } from 'react-native'
import { useTheme } from '../theme/ThemeProvider'
import { useSettingsStore, CalculationMethod } from '../stores/settingsStore'
import { ThemePicker } from '../components/settings/ThemePicker'
import * as Haptics from 'expo-haptics'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

const calculationMethods: { value: CalculationMethod; label: string }[] = [
  { value: 'ummAlQura', label: 'Umm Al-Qura' },
  { value: 'muslimWorldLeague', label: 'Muslim World League' },
  { value: 'isna', label: 'ISNA' },
  { value: 'karachi', label: 'Karachi' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'egyptian', label: 'Egyptian' },
  { value: 'turkey', label: 'Turkey' },
  { value: 'kuwait', label: 'Kuwait' },
  { value: 'qatar', label: 'Qatar' },
]

export default function SettingsScreen() {
  const theme = useTheme()
  const { hapticsEnabled, setHapticsEnabled, calculationMethod, setCalculationMethod } = useSettingsStore()
  const [showMethodPicker, setShowMethodPicker] = useState(false)

  const handleHapticsToggle = (value: boolean) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    setHapticsEnabled(value)
  }

  const handleMethodSelect = (method: CalculationMethod) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    setCalculationMethod(method)
    setShowMethodPicker(false)
  }

  const selectedMethodLabel = calculationMethods.find((m) => m.value === calculationMethod)?.label || ''

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>

          <ThemePicker />

          <View style={[styles.settingRow, { backgroundColor: theme.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Haptic Feedback</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Vibration feedback on interactions
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleHapticsToggle}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={hapticsEnabled ? theme.primary : theme.textMuted}
            />
          </View>
        </View>

        {/* Prayer Times Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Prayer Times</Text>

          <Pressable
            onPress={() => setShowMethodPicker(!showMethodPicker)}
            style={[styles.settingRow, { backgroundColor: theme.surface }]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Calculation Method</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                {selectedMethodLabel}
              </Text>
            </View>
            <Ionicons
              name={showMethodPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>

          {showMethodPicker && (
            <View style={[styles.picker, { backgroundColor: theme.surfaceElevated }]}>
              {calculationMethods.map((method) => (
                <Pressable
                  key={method.value}
                  onPress={() => handleMethodSelect(method.value)}
                  style={[
                    styles.pickerOption,
                    {
                      backgroundColor:
                        calculationMethod === method.value ? theme.primary + '20' : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      {
                        color:
                          calculationMethod === method.value ? theme.primary : theme.text,
                        fontWeight: calculationMethod === method.value ? '600' : '400',
                      },
                    ]}
                  >
                    {method.label}
                  </Text>
                  {calculationMethod === method.value && (
                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>

          <View style={[styles.settingRow, { backgroundColor: theme.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Version</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                1.0.0
              </Text>
            </View>
          </View>

          <View style={[styles.settingRow, { backgroundColor: theme.surface, marginTop: 12 }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Qefari Quran</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                A comprehensive Islamic app for prayer times, Quran, Qibla, and night prayer tracking
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  picker: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  bottomSpacer: {
    height: 32,
  },
})
