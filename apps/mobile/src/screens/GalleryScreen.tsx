import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Header } from '../components/Header';
import { MediaPlayer } from '../components/MediaPlayer';
import { getSavedMediaItems, deleteSavedMediaItem } from '../services/storageService';
import { SavedMediaItem, MediaType } from '../types/media';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';

export const GalleryScreen: React.FC = () => {
  const [items, setItems] = useState<SavedMediaItem[]>([]);
  const [filter, setFilter] = useState<MediaType | 'all'>('all');
  const [selectedMedia, setSelectedMedia] = useState<{
    uri: string;
    type: MediaType;
    title: string;
  } | null>(null);

  const loadItems = async () => {
    const saved = await getSavedMediaItems();
    setItems(saved);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = filter === 'all' ? items : items.filter((i) => i.type === filter);

  const handleDelete = (item: SavedMediaItem) => {
    Alert.alert('Delete File', `Are you sure you want to delete ${item.filename}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSavedMediaItem(item.id, item.localUri);
          loadItems();
        }
      }
    ]);
  };

  const handleShare = async (localUri: string) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(localUri);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Offline Gallery" subtitle="Play videos, listen to MP3s & view photos" />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'video', 'audio', 'image'] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filter === cat && styles.activeFilterChip]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.filterText, filter === cat && styles.activeFilterText]}>
              {cat.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() =>
                  setSelectedMedia({
                    uri: item.localUri,
                    type: item.type,
                    title: item.filename
                  })
                }
              >
                <View style={styles.thumbBox}>
                  {item.thumbnail ? (
                    <Image source={{ uri: item.thumbnail }} style={styles.thumbImage} />
                  ) : (
                    <Ionicons
                      name={item.type === 'video' ? 'film' : item.type === 'audio' ? 'musical-notes' : 'image'}
                      size={28}
                      color="#6366F1"
                    />
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.filename} numberOfLines={1}>
                    {item.filename}
                  </Text>
                  <Text style={styles.meta}>
                    {item.platform} • {item.type.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleShare(item.localUri)} style={styles.actionBtn}>
                  <Ionicons name="share-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={48} color="#64748B" />
          <Text style={styles.emptyText}>No saved {filter !== 'all' ? filter : 'media'} files found.</Text>
        </View>
      )}

      {selectedMedia && (
        <MediaPlayer
          visible={!!selectedMedia}
          mediaUri={selectedMedia.uri}
          mediaType={selectedMedia.type}
          title={selectedMedia.title}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  activeFilterChip: {
    backgroundColor: '#4F46E5',
    borderColor: '#6366F1'
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700'
  },
  activeFilterText: {
    color: '#FFFFFF'
  },
  list: {
    paddingVertical: 12
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  thumbBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12
  },
  thumbImage: {
    width: '100%',
    height: '100%'
  },
  info: {
    flex: 1
  },
  filename: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600'
  },
  meta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionBtn: {
    padding: 8,
    marginLeft: 4
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 12
  }
});
