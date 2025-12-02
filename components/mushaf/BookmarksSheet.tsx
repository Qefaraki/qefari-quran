import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList } from 'react-native';
import { themes } from '../../theme/colors';
import { useSettingsStore } from '../../stores/settingsStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (globalIndex: number) => void;
  bookmarks: Array<{
    id: string;
    globalIndex: number;
    surahNumber: number;
    ayahNumber: number;
    colorIndex: number;
    createdAt: string;
  }>;
  onRemove: (id: string) => void;
}

const BOOKMARK_COLORS = [
  '#D4AF37', // Gold
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#A78BFA', // Purple
  '#F97316', // Orange
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#EC4899', // Pink
];

const BookmarksSheet: React.FC<Props> = ({ visible, onClose, onSelect, bookmarks, onRemove }) => {
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
          <Text style={[styles.title, { color: colors.text }]}>Bookmarks</Text>
          <Pressable onPress={onClose}>
            <Text style={[styles.doneButton, { color: colors.primary }]}>Done</Text>
          </Pressable>
        </View>

        {bookmarks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No bookmarks yet</Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Long press on an ayah to bookmark</Text>
          </View>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.row,
                  { borderBottomColor: colors.surface },
                  pressed && { backgroundColor: colors.surface }
                ]}
                onPress={() => {
                  onSelect(item.globalIndex);
                  onClose();
                }}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.colorDot, { backgroundColor: BOOKMARK_COLORS[item.colorIndex] || BOOKMARK_COLORS[0] }]} />
                  <View>
                    <Text style={[styles.surahInfo, { color: colors.text }]}>Surah {item.surahNumber}</Text>
                    <Text style={[styles.ayahInfo, { color: colors.textSecondary }]}>Ayah {item.ayahNumber}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => onRemove(item.id)}
                  hitSlop={10}
                >
                  <Text style={[styles.removeButton, { color: colors.error }]}>Remove</Text>
                </Pressable>
              </Pressable>
            )}
          />
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
  },
  emptyHint: {
    fontSize: 14,
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
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  surahInfo: {
    fontSize: 16,
    fontWeight: '500',
  },
  ayahInfo: {
    fontSize: 14,
  },
  removeButton: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default BookmarksSheet;
