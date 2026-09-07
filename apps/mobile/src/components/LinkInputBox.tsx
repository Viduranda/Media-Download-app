import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

interface LinkInputBoxProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const LinkInputBox: React.FC<LinkInputBoxProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.trim().startsWith('http')) {
        setUrl(text.trim());
        onAnalyze(text.trim());
      }
    } catch (e) {
      console.warn('Clipboard read error:', e);
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  const handleSubmit = () => {
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Paste Media Link</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="link-outline" size={20} color="#64748B" style={styles.linkIcon} />
        <TextInput
          style={styles.input}
          placeholder="https://instagram.com/..., youtube.com/..., tiktok..."
          placeholderTextColor="#64748B"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {url.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.iconBtn}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handlePaste} style={styles.pasteBtn}>
          <Ionicons name="clipboard-outline" size={16} color="#6366F1" />
          <Text style={styles.pasteText}>Paste</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.analyzeBtn, (!url.trim() || isLoading) && styles.disabledBtn]}
        onPress={handleSubmit}
        disabled={!url.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.analyzeBtnText}>Analyze Link</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  label: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#334155'
  },
  linkIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13
  },
  iconBtn: {
    padding: 4
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6
  },
  pasteText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    height: 46,
    marginTop: 12
  },
  disabledBtn: {
    backgroundColor: '#334155',
    opacity: 0.7
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600'
  }
});
