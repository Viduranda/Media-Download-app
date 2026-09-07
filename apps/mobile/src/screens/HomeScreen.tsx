import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Alert } from 'react-native';
import { Header } from '../components/Header';
import { LinkInputBox } from '../components/LinkInputBox';
import { MediaPreview } from '../components/MediaPreview';
import { FormatSelector } from '../components/FormatSelector';
import { extractMedia } from '../services/apiService';
import { downloadManager } from '../services/downloadManager';
import { MediaMetadata, MediaFormat } from '../types/media';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mediaData, setMediaData] = useState<MediaMetadata | null>(null);

  const handleAnalyzeLink = async (url: string) => {
    setIsLoading(true);
    setMediaData(null);
    try {
      const data = await extractMedia(url);
      setMediaData(data);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Could not analyze media link. Please verify link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFormat = async (format: MediaFormat) => {
    if (!mediaData) return;
    try {
      if (!format.downloadUrl) {
        Alert.alert('Download Error', 'Download URL is invalid or backend server is offline.');
        return;
      }
      await downloadManager.startDownload(mediaData, format);
      Alert.alert(
        'Download Started',
        `Started downloading ${format.quality}. You can track progress in Downloads tab.`,
        [
          { text: 'Stay Here', style: 'cancel' },
          { text: 'View Downloads', onPress: () => navigation.navigate('Downloads') }
        ]
      );
    } catch (e: any) {
      Alert.alert('Download Error', e?.message || 'Could not start download.');
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinkInputBox onAnalyze={handleAnalyzeLink} isLoading={isLoading} />

        {mediaData && (
          <>
            <MediaPreview metadata={mediaData} />
            <FormatSelector formats={mediaData.formats} onSelectFormat={handleSelectFormat} />
          </>
        )}

        {!mediaData && !isLoading && (
          <View style={styles.supportedContainer}>
            <Text style={styles.supportedTitle}>Supported Platforms & Sources</Text>
            <View style={styles.grid}>
              {['YouTube', 'Instagram', 'TikTok', 'Facebook', 'Twitter / X', 'Pinterest', 'MP3 Files', 'MP4 Videos'].map((platform) => (
                <View key={platform} style={styles.chip}>
                  <Text style={styles.chipText}>{platform}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  scrollContent: {
    paddingBottom: 40
  },
  supportedContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  supportedTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  chip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  chipText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500'
  }
});
