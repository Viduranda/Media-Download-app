import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MediaMetadata } from '../types/media';

interface MediaPreviewProps {
  metadata: MediaMetadata;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ metadata }) => {
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.thumbnailContainer}>
        {metadata.thumbnail ? (
          <Image source={{ uri: metadata.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Ionicons name="play-circle-outline" size={48} color="#64748B" />
          </View>
        )}
        <View style={styles.platformBadge}>
          <Ionicons name={metadata.platform.icon as any} size={14} color="#FFFFFF" />
          <Text style={styles.platformText}>{metadata.platform.name}</Text>
        </View>

        {metadata.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(metadata.duration)}</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {metadata.title}
        </Text>
        {metadata.author && (
          <Text style={styles.author} numberOfLines={1}>
            By {metadata.author}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155'
  },
  thumbnailContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A'
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A'
  },
  platformBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },
  platformText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  details: {
    padding: 14
  },
  title: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20
  },
  author: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4
  }
});
