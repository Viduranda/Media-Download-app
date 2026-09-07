import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MediaFormat, MediaType } from '../types/media';

interface FormatSelectorProps {
  formats: MediaFormat[];
  onSelectFormat: (format: MediaFormat) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({ formats, onSelectFormat }) => {
  const [activeTab, setActiveTab] = useState<MediaType>('video');

  const filteredFormats = formats.filter(f => f.type === activeTab);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Select Download Format</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'video' && styles.activeTab]}
          onPress={() => setActiveTab('video')}
        >
          <Ionicons
            name="videocam-outline"
            size={16}
            color={activeTab === 'video' ? '#FFFFFF' : '#94A3B8'}
          />
          <Text style={[styles.tabText, activeTab === 'video' && styles.activeTabText]}>
            Video (MP4)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'audio' && styles.activeTab]}
          onPress={() => setActiveTab('audio')}
        >
          <Ionicons
            name="musical-notes-outline"
            size={16}
            color={activeTab === 'audio' ? '#FFFFFF' : '#94A3B8'}
          />
          <Text style={[styles.tabText, activeTab === 'audio' && styles.activeTabText]}>
            Audio (MP3)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'image' && styles.activeTab]}
          onPress={() => setActiveTab('image')}
        >
          <Ionicons
            name="image-outline"
            size={16}
            color={activeTab === 'image' ? '#FFFFFF' : '#94A3B8'}
          />
          <Text style={[styles.tabText, activeTab === 'image' && styles.activeTabText]}>
            Photo / Thumbnail
          </Text>
        </TouchableOpacity>
      </View>

      {/* Format List */}
      <ScrollView style={styles.list} nestedScrollEnabled>
        {filteredFormats.length > 0 ? (
          filteredFormats.map(item => (
            <View key={item.id} style={styles.formatItem}>
              <View style={styles.formatInfo}>
                <Text style={styles.qualityText}>{item.quality}</Text>
                <Text style={styles.resText}>
                  Format: {item.ext.toUpperCase()} • {item.resolution}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => onSelectFormat(item)}
              >
                <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                <Text style={styles.downloadBtnText}>Download</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} format available for this link.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: '#4F46E5'
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  activeTabText: {
    color: '#FFFFFF'
  },
  list: {
    maxHeight: 220
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  formatInfo: {
    flex: 1,
    marginRight: 8
  },
  qualityText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600'
  },
  resText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center'
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13
  }
});
