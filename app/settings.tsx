import { View, Text, StyleSheet, ScrollView } from 'react-native'

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Settings</Text>
        <Text style={styles.subtitle}>Theme, language, notifications, and more</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  text: { color: '#FFFFFF', fontSize: 24 },
  subtitle: { color: '#888888', fontSize: 14, marginTop: 8 },
})
