import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBackendApiUrl, setBackendApiUrl } from '../services/apiService';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Media Downloader',
  subtitle = 'Download Videos, MP3s & Photos from Any Link'
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    getBackendApiUrl().then(url => setServerUrl(url));
  }, [modalVisible]);

  const handleSave = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid Backend API URL.');
      return;
    }
    await setBackendApiUrl(serverUrl.trim());
    setModalVisible(false);
    Alert.alert('Server URL Updated', `Backend API URL set to:\n${serverUrl.trim()}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="cloud-download-sharp" size={26} color="#6366F1" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity style={styles.settingsButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="settings-outline" size={22} color="#94A3B8" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Backend Server Settings</Text>
            <Text style={styles.modalSubtitle}>
              Enter your live Cloud URL (Koyeb) or Localtunnel HTTPS URL:
            </Text>

            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://172.16.74.21:4000/api"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>Save URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  textContainer: {
    flex: 1
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700'
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2
  },
  settingsButton: {
    padding: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  cancelButton: {
    backgroundColor: '#334155'
  },
  cancelText: {
    color: '#94A3B8',
    fontWeight: '600'
  },
  saveButton: {
    backgroundColor: '#6366F1'
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '600'
  }
});
