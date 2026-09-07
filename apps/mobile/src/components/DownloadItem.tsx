import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DownloadTask } from '../types/media';

interface DownloadItemProps {
  task: DownloadTask;
  onCancel: (id: string) => void;
  onOpen: (task: DownloadTask) => void;
}

export const DownloadItem: React.FC<DownloadItemProps> = ({ task, onCancel, onOpen }) => {
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.thumbnailContainer}>
          {task.thumbnail ? (
            <Image source={{ uri: task.thumbnail }} style={styles.thumbnail} />
          ) : (
            <Ionicons
              name={task.type === 'video' ? 'film' : task.type === 'audio' ? 'musical-notes' : 'image'}
              size={24}
              color="#6366F1"
            />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          <Text style={styles.meta}>
            {task.platform} • {task.quality} • {task.ext.toUpperCase()}
          </Text>
        </View>

        <View style={styles.actionBtn}>
          {task.status === 'downloading' && (
            <TouchableOpacity onPress={() => onCancel(task.id)} style={styles.cancelBtn}>
              <Ionicons name="close" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}

          {task.status === 'completed' && (
            <TouchableOpacity onPress={() => onOpen(task)} style={styles.openBtn}>
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text style={styles.openText}>Play</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Progress Bar & Status */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${task.progress}%`,
                backgroundColor: task.status === 'completed' ? '#10B981' : task.status === 'failed' ? '#EF4444' : '#6366F1'
              }
            ]}
          />
        </View>

        <View style={styles.statsRow}>
          {task.status === 'downloading' ? (
            <>
              <Text style={styles.statsText}>
                {formatBytes(task.downloadedBytes)} / {task.totalBytes ? formatBytes(task.totalBytes) : '...'} ({task.progress}%)
              </Text>

              <Text style={styles.speedText}>{task.speed}</Text>
            </>
          ) : task.status === 'completed' ? (
            <Text style={styles.successText}>
              ✓ Download Complete {task.savedToGallery ? '• Saved to Device Gallery' : ''}
            </Text>
          ) : (
            <Text style={styles.errorText}>✕ Download Failed</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  thumbnailContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 10
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  info: {
    flex: 1
  },
  title: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600'
  },
  meta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2
  },
  actionBtn: {
    marginLeft: 8
  },
  cancelBtn: {
    padding: 6,
    backgroundColor: '#334155',
    borderRadius: 8
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  openText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4
  },
  progressContainer: {
    marginTop: 10
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6
  },
  statsText: {
    color: '#94A3B8',
    fontSize: 11
  },
  speedText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '600'
  },
  successText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600'
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600'
  }
});
