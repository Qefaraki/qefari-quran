import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { LegendList } from '@legendapp/list';
import { themes } from '../../theme/colors';
import { useSettingsStore } from '../../stores/settingsStore';
import { useMushafStore } from '../../stores/mushafStore';
import { useDebouncedPosition } from '../../hooks/useDebouncedPosition';
import {
  getListItems,
  getListIndexForSurah,
  getListIndexForAyah,
  getAllSurahs,
  ListItem,
} from '../../data/quranLoader';
import { estimateAyahHeight, estimateSurahHeaderHeight } from '../../utils/ayahHeightEstimator';
import AyahView from '../../components/mushaf/AyahView';
import SurahHeader from '../../components/mushaf/SurahHeader';
import SurahListSheet from '../../components/mushaf/SurahListSheet';
import BookmarksSheet from '../../components/mushaf/BookmarksSheet';

export default function MushafScreen() {
  const themeId = useSettingsStore((state) => state.themeId);
  const colors = themes[themeId as keyof typeof themes] || themes['gold-dark'];

  const { currentPosition, bookmarks, fontSize, lineSpacing, addBookmark, removeBookmark } = useMushafStore();

  const listRef = useRef<any>(null);
  const debouncedUpdate = useDebouncedPosition(500);

  const [showSurahSheet, setShowSurahSheet] = useState(false);
  const [showBookmarksSheet, setShowBookmarksSheet] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [currentAyah, setCurrentAyah] = useState<number>(1);

  // Memoize list items (computed once, cached forever)
  const listItems = useMemo(() => getListItems(), []);
  const allSurahs = useMemo(() => getAllSurahs(), []);

  // Restore position on mount
  useEffect(() => {
    if (currentPosition > 0 && listRef.current) {
      const listIndex = getListIndexForAyah(currentPosition);
      if (listIndex >= 0) {
        // Small delay to ensure list is ready
        setTimeout(() => {
          listRef.current?.scrollToIndex({ index: listIndex, animated: false });
        }, 100);
      }
    }
  }, []);

  // Check if ayah is bookmarked
  const isAyahBookmarked = useCallback(
    (globalIndex: number) => {
      return bookmarks.some((b) => b.globalIndex === globalIndex);
    },
    [bookmarks]
  );

  // Handle ayah press (toggle bookmark)
  const handleAyahPress = useCallback(
    (globalIndex: number, surahNumber: number, ayahNumber: number) => {
      const existingBookmark = bookmarks.find((b) => b.globalIndex === globalIndex);
      if (existingBookmark) {
        removeBookmark(existingBookmark.id);
      } else {
        addBookmark(surahNumber, ayahNumber, globalIndex);
      }
    },
    [bookmarks, addBookmark, removeBookmark]
  );

  // Navigate to surah
  const handleSurahSelect = useCallback((surahId: number) => {
    const listIndex = getListIndexForSurah(surahId);
    if (listIndex >= 0 && listRef.current) {
      listRef.current.scrollToIndex({ index: listIndex, animated: true });
    }
  }, []);

  // Navigate to bookmark
  const handleBookmarkSelect = useCallback((globalIndex: number) => {
    const listIndex = getListIndexForAyah(globalIndex);
    if (listIndex >= 0 && listRef.current) {
      listRef.current.scrollToIndex({ index: listIndex, animated: true });
    }
  }, []);

  // Handle scroll position updates
  const handleViewableItemsChanged = useCallback(
    (info: any) => {
      if (info.viewableItems && info.viewableItems.length > 0) {
        const firstVisibleItem = info.viewableItems[0];
        const item = firstVisibleItem.item as ListItem;

        if (item.type === 'ayah' && item.ayah) {
          debouncedUpdate(item.ayah.globalIndex);
          setCurrentSurah(item.ayah.surahNumber);
          setCurrentAyah(item.ayah.ayahNumber);
        } else if (item.type === 'surah' && item.surah) {
          setCurrentSurah(item.surah.id);
          setCurrentAyah(1);
        }
      }
    },
    [debouncedUpdate]
  );

  // Estimate item height for recycling
  const estimateItemHeight = useCallback(
    (item: ListItem) => {
      if (item.type === 'surah') {
        return estimateSurahHeaderHeight();
      }
      if (item.type === 'ayah' && item.ayah) {
        return estimateAyahHeight(item.ayah, fontSize, lineSpacing);
      }
      return 100; // Fallback
    },
    [fontSize, lineSpacing]
  );

  // Render list item
  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'surah' && item.surah) {
        return <SurahHeader surah={item.surah} />;
      }

      if (item.type === 'ayah' && item.ayah) {
        const isBookmarked = isAyahBookmarked(item.ayah.globalIndex);
        return (
          <AyahView
            ayah={item.ayah}
            fontSize={fontSize}
            lineSpacing={lineSpacing}
            isBookmarked={isBookmarked}
            onPress={() =>
              handleAyahPress(item.ayah!.globalIndex, item.ayah!.surahNumber, item.ayah!.ayahNumber)
            }
            onLongPress={() =>
              handleAyahPress(item.ayah!.globalIndex, item.ayah!.surahNumber, item.ayah!.ayahNumber)
            }
          />
        );
      }

      return null;
    },
    [fontSize, lineSpacing, isAyahBookmarked, handleAyahPress]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => setShowSurahSheet(true)}
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.headerButtonText, { color: colors.text }]}>Surahs</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowBookmarksSheet(true)}
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.headerButtonText, { color: colors.text }]}>Bookmarks</Text>
          </Pressable>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentSurah}:{currentAyah}
          </Text>
        </View>
      </View>

      {/* List */}
      <LegendList
        ref={listRef}
        data={listItems}
        renderItem={renderItem}
        estimatedItemSize={100}
        maintainScrollAtEnd={false}
        recycleItems={true}
        drawDistance={300}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          minimumViewTime: 100,
        }}
        keyExtractor={(item: ListItem, index: number) => {
          if (item.type === 'surah' && item.surah) {
            return `surah-${item.surah.id}`;
          }
          if (item.type === 'ayah' && item.ayah) {
            return `ayah-${item.ayah.globalIndex}`;
          }
          return `item-${index}`;
        }}
      />

      {/* Modals */}
      <SurahListSheet
        visible={showSurahSheet}
        onClose={() => setShowSurahSheet(false)}
        onSelect={handleSurahSelect}
        surahs={allSurahs}
      />

      <BookmarksSheet
        visible={showBookmarksSheet}
        onClose={() => setShowBookmarksSheet(false)}
        onSelect={handleBookmarkSelect}
        bookmarks={bookmarks}
        onRemove={removeBookmark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
