import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { MediaType } from '../types/media';

interface MediaPlayerProps {
  visible: boolean;
  mediaUri: string | null;
  mediaType: MediaType;
  title: string;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
  visible,
  mediaUri,
  mediaType,
  title,
  onClose
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const toggleAudio = async () => {
    if (!mediaUri) return;
    try {
      if (sound) {
        if (isPlayingAudio) {
          await sound.pauseAsync();
          setIsPlayingAudio(false);
        } else {
          await sound.playAsync();
          setIsPlayingAudio(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: mediaUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlayingAudio(true);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlayingAudio(false);
          }
        });
      }
    } catch (e) {
      console.error('Failed to play audio:', e);
    }
  };

  const handleClose = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlayingAudio(false);
    onClose();
  };

  if (!visible || !mediaUri) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Content Viewer */}
        <View style={styles.contentArea}>
          {mediaType === 'video' && (
            <Video
              style={styles.videoPlayer}
              source={{ uri: mediaUri }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              shouldPlay
            />
          )}

          {mediaType === 'image' && (
            <Image source={{ uri: mediaUri }} style={styles.imageViewer} resizeMode="contain" />
          )}

          {mediaType === 'audio' && (
            <View style={styles.audioPlayerContainer}>
              <View style={styles.audioDisc}>
                <Ionicons name="musical-notes" size={64} color="#6366F1" />
              </View>
              <Text style={styles.audioTitle} numberOfLines={2}>
                {title}
              </Text>
              <TouchableOpacity onPress={toggleAudio} style={styles.playAudioBtn}>
                <Ionicons
                  name={isPlayingAudio ? 'pause-circle' : 'play-circle'}
                  size={72}
                  color="#6366F1"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#1E293B'
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 16
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#334155',
    borderRadius: 20
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  videoPlayer: {
    width: width,
    height: 350
  },
  imageViewer: {
    width: width,
    height: '80%'
  },
  audioPlayerContainer: {
    alignItems: 'center',
    padding: 24
  },
  audioDisc: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#6366F1'
  },
  audioTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20
  },
  playAudioBtn: {
    marginTop: 10
  }
});
