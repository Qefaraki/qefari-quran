import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { themes } from '../../theme/colors';
import { useSettingsStore } from '../../stores/settingsStore';

interface Props {
  surah: {
    id: number;
    nameArabic: string;
    nameEnglish: string;
    ayahCount: number;
  };
}

const SurahHeader: React.FC<Props> = React.memo(({ surah }) => {
  const themeId = useSettingsStore((state) => state.themeId);
  const colors = themes[themeId as keyof typeof themes] || themes['gold-dark'];
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <View style={[styles.numberCircle, { backgroundColor: colors.primary }]}>
          <Text style={styles.numberText}>{surah.id}</Text>
        </View>

        <View style={styles.centerContent}>
          <Text style={[styles.nameArabic, { color: colors.text }]}>{surah.nameArabic}</Text>
          <Text style={[styles.nameEnglish, { color: colors.textSecondary }]}>{surah.nameEnglish}</Text>
        </View>

        <Text style={[styles.ayahCount, { color: colors.textMuted }]}>{surah.ayahCount} Ayahs</Text>
      </View>

      {surah.id !== 1 && surah.id !== 9 && (
        <View style={[styles.bismillahContainer, { borderTopColor: colors.border }]}>
          <Text style={[styles.bismillahText, { color: colors.primary }]}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 16,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
  },
  nameArabic: {
    fontSize: 24,
    fontFamily: 'KFGQPCHAFSUthmanicScript',
  },
  nameEnglish: {
    fontSize: 14,
    marginTop: 4,
  },
  ayahCount: {
    fontSize: 12,
  },
  bismillahContainer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  bismillahText: {
    fontSize: 22,
    fontFamily: 'KFGQPCHAFSUthmanicScript',
  },
});

export default SurahHeader;
