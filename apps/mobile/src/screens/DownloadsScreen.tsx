import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Header } from '../components/Header';
import { DownloadItem } from '../components/DownloadItem';
import { MediaPlayer } from '../components/MediaPlayer';
import { downloadManager } from '../services/downloadManager';
import { DownloadTask, MediaType } from '../types/media';

export const DownloadsScreen: React.FC = () => {
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<{
    uri: string;
    type: MediaType;
    title: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = downloadManager.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
    });
    return () => unsubscribe();
  }, []);

  const handleCancel = (id: string) => {
    downloadManager.cancelDownload(id);
  };

  const handleOpen = (task: DownloadTask) => {
    if (task.localUri) {
      setSelectedMedia({
        uri: task.localUri,
        type: task.type,
        title: task.title
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Active Downloads" subtitle="Track progress, speeds & status" />

      {tasks.length > 0 ? (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DownloadItem task={item} onCancel={handleCancel} onOpen={handleOpen} />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Downloads Yet</Text>
          <Text style={styles.emptySubtitle}>
            Paste a link on the Home tab to start downloading videos, MP3s, or photos.
          </Text>
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
  listContent: {
    paddingVertical: 16
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20
  }
});
