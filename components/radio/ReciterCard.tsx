import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme/ThemeProvider'
import { Reciter } from '../../stores/audioStore'

interface ReciterCardProps {
  reciter: Reciter
  isPlaying: boolean
  isCurrentReciter: boolean
  downloadProgress?: number
  onPress: () => void
}

export function ReciterCard({
  reciter,
  isPlaying,
  isCurrentReciter,
  downloadProgress,
  onPress,
}: ReciterCardProps) {
  const theme = useTheme()

  const isDownloading = downloadProgress !== undefined && downloadProgress > 0 && downloadProgress < 100
  const isAvailable = reciter.isBundled || reciter.isDownloaded

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getIcon = () => {
    if (isDownloading) {
      return null // Will show progress indicator
    }
    if (!isAvailable) {
      return 'cloud-download-outline'
    }
    if (isCurrentReciter && isPlaying) {
      return 'pause-circle'
    }
    return 'play-circle'
  }

  const iconName = getIcon()

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.nameArabic, { color: theme.text }]}>{reciter.nameArabic}</Text>
          <Text style={[styles.name, { color: theme.textSecondary }]}>{reciter.name}</Text>
          {!reciter.isBundled && (
            <Text style={[styles.fileSize, { color: theme.textMuted }]}>
              {formatFileSize(reciter.fileSize)}
            </Text>
          )}
        </View>

        <View style={styles.actionContainer}>
          {isDownloading ? (
            <View style={styles.downloadContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.downloadProgress, { color: theme.primary }]}>
                {downloadProgress}%
              </Text>
            </View>
          ) : (
            iconName && (
              <Ionicons
                name={iconName as any}
                size={40}
                color={isCurrentReciter ? theme.primary : theme.textSecondary}
              />
            )
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  nameArabic: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  downloadContainer: {
    alignItems: 'center',
  },
  downloadProgress: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
})
