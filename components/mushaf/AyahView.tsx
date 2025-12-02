import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { themes } from '../../theme/colors';
import { useSettingsStore } from '../../stores/settingsStore';

interface Props {
  ayah: {
    globalIndex: number;
    surahNumber: number;
    ayahNumber: number;
    textArabic: string;
  };
  fontSize?: number;
  lineSpacing?: number;
  isBookmarked?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

const toArabicNumerals = (num: number): string => {
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

const AyahView: React.FC<Props> = React.memo(({
  ayah,
  fontSize = 28,
  lineSpacing = 16,
  isBookmarked,
  onPress,
  onLongPress
}) => {
  const themeId = useSettingsStore((state) => state.themeId);
  const colors = themes[themeId as keyof typeof themes] || themes['gold-dark'];

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        { paddingVertical: lineSpacing },
        isBookmarked && { backgroundColor: `${colors.primary}20` },
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.text, { fontSize, lineHeight: fontSize * 1.8, color: colors.text }]}>
        {ayah.textArabic} ﴿{toArabicNumerals(ayah.ayahNumber)}﴾
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  text: {
    fontFamily: 'KFGQPCHAFSUthmanicScript',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default AyahView;
