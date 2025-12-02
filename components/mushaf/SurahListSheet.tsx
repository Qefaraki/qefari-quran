import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList } from 'react-native';
import { themes } from '../../theme/colors';
import { useSettingsStore } from '../../stores/settingsStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (surahId: number) => void;
  surahs: Array<{
    id: number;
    nameArabic: string;
    nameEnglish: string;
    ayahCount: number;
  }>;
}

const SurahListSheet: React.FC<Props> = ({ visible, onClose, onSelect, surahs }) => {
  const themeId = useSettingsStore((state) => state.themeId);
  const colors = themes[themeId as keyof typeof themes] || themes['gold-dark'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Surahs</Text>
          <Pressable onPress={onClose}>
            <Text style={[styles.doneButton, { color: colors.primary }]}>Done</Text>
          </Pressable>
        </View>

        <FlatList
          data={surahs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                { borderBottomColor: colors.surface },
                pressed && { backgroundColor: colors.surface }
              ]}
              onPress={() => {
                onSelect(item.id);
                onClose();
              }}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.numberCircle, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.numberText, { color: colors.text }]}>{item.id}</Text>
                </View>
                <View>
                  <Text style={[styles.surahNameArabic, { color: colors.text }]}>{item.nameArabic}</Text>
                  <Text style={[styles.surahNameEnglish, { color: colors.textSecondary }]}>{item.nameEnglish}</Text>
                </View>
              </View>
              <Text style={[styles.ayahCount, { color: colors.textMuted }]}>{item.ayahCount} Ayahs</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  surahNameArabic: {
    fontSize: 20,
    fontFamily: 'KFGQPCHAFSUthmanicScript',
  },
  surahNameEnglish: {
    fontSize: 14,
  },
  ayahCount: {
    fontSize: 14,
  },
});

export default SurahListSheet;
