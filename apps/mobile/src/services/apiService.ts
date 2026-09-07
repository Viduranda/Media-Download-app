import * as FileSystem from 'expo-file-system';
import { MediaMetadata, MediaFormat, PlatformInfo } from '../types/media';

let cachedBackendUrl = 'http://172.16.74.21:4000/api';
const CONFIG_FILE = `${FileSystem.documentDirectory}backend_config.json`;

/**
 * Get active Backend API URL from storage or fallback
 */
export async function getBackendApiUrl(): Promise<string> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(CONFIG_FILE);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(CONFIG_FILE);
      const data = JSON.parse(content);
      if (data.url && typeof data.url === 'string') {
        cachedBackendUrl = data.url.trim();
      }
    }
  } catch (e) {
    // fallback
  }
  return cachedBackendUrl;
}

/**
 * Update and persist Backend API URL
 */
export async function setBackendApiUrl(newUrl: string): Promise<void> {
  let cleanUrl = newUrl.trim();
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api`;
  }
  cachedBackendUrl = cleanUrl;
  try {
    await FileSystem.writeAsStringAsync(CONFIG_FILE, JSON.stringify({ url: cachedBackendUrl }));
  } catch (e) {
    console.error('Failed to save backend URL config:', e);
  }
}

/**
 * Identify social platform from link
 */
export function getPlatformFromUrl(url: string): PlatformInfo {
  const cleanUrl = url.toLowerCase();
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    return { name: 'YouTube', id: 'youtube', icon: 'logo-youtube' };
  }
  if (cleanUrl.includes('instagram.com')) {
    return { name: 'Instagram', id: 'instagram', icon: 'logo-instagram' };
  }
  if (cleanUrl.includes('tiktok.com')) {
    return { name: 'TikTok', id: 'tiktok', icon: 'musical-notes' };
  }
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
    return { name: 'Facebook', id: 'facebook', icon: 'logo-facebook' };
  }
  if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) {
    return { name: 'Twitter / X', id: 'twitter', icon: 'logo-twitter' };
  }
  if (cleanUrl.includes('pinterest.com') || cleanUrl.includes('pin.it')) {
    return { name: 'Pinterest', id: 'pinterest', icon: 'image' };
  }
  return { name: 'Direct Link', id: 'direct', icon: 'link' };
}

/**
 * Check if a URL points directly to a raw media file (MP4, MP3, JPG, PNG, WEBP)
 */
function isDirectMediaFile(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('.mp4') ||
    lowerUrl.includes('.webm') ||
    lowerUrl.includes('.mp3') ||
    lowerUrl.includes('.wav') ||
    lowerUrl.includes('.m4a') ||
    lowerUrl.includes('.jpg') ||
    lowerUrl.includes('.jpeg') ||
    lowerUrl.includes('.png') ||
    lowerUrl.includes('.webp')
  );
}

/**
 * Extract media information from URL using local server, public cloud engine, or direct URL parser
 */
export async function extractMedia(url: string): Promise<MediaMetadata> {
  const cleanUrl = url.trim();
  const platform = getPlatformFromUrl(cleanUrl);
  const activeBackendUrl = await getBackendApiUrl();

  // 1. Try backend API server first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${activeBackendUrl}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
  } catch (error) {
    console.warn(`Backend server unreachable at ${activeBackendUrl}:`, error);
  }

  // 2. If it's a direct file link (e.g. .mp4, .mp3, .jpg), allow downloading directly without backend proxy
  if (isDirectMediaFile(cleanUrl)) {
    return generateClientFallbackMetadata(cleanUrl, platform, true, activeBackendUrl);
  }

  // 3. For social media links (YouTube, Instagram, TikTok, etc.), backend is required
  throw new Error(
    `Cannot connect to backend server (${activeBackendUrl}). Tap the Settings icon ⚙️ in the top right header to set your live cloud or Localtunnel server URL.`
  );
}

/**
 * Generate fallback metadata for direct file links
 */
function generateClientFallbackMetadata(url: string, platform: PlatformInfo, isDirect: boolean, activeBackendUrl: string): MediaMetadata {
  const lowerUrl = url.toLowerCase();
  let defaultType: 'video' | 'audio' | 'image' = 'video';
  let defaultExt = 'mp4';

  if (lowerUrl.includes('.mp3') || lowerUrl.includes('.wav') || lowerUrl.includes('.m4a')) {
    defaultType = 'audio';
    defaultExt = 'mp3';
  } else if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.png') || lowerUrl.includes('.webp')) {
    defaultType = 'image';
    defaultExt = 'jpg';
  }

  const filenameFromUrl = `${platform.name}_Media`;

  // Use direct URL for direct files, or proxy for backend
  const downloadUrl = isDirect
    ? url
    : `${activeBackendUrl}/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filenameFromUrl)}&type=${defaultType}&ext=${defaultExt}`;

  const formats: MediaFormat[] = [];

  if (defaultType === 'video') {
    formats.push({
      id: 'video-direct',
      quality: 'Video Stream (MP4)',
      resolution: 'Original Quality',
      ext: 'mp4',
      type: 'video',
      downloadUrl: downloadUrl
    });
  } else if (defaultType === 'audio') {
    formats.push({
      id: 'mp3-direct',
      quality: 'Audio File (MP3)',
      resolution: 'Audio Only',
      ext: 'mp3',
      type: 'audio',
      downloadUrl: downloadUrl
    });
  } else if (defaultType === 'image') {
    formats.push({
      id: 'image-direct',
      quality: 'High Resolution Photo',
      resolution: 'Original Quality',
      ext: defaultExt,
      type: 'image',
      downloadUrl: downloadUrl
    });
  }

  return {
    title: filenameFromUrl,
    thumbnail: defaultType === 'image' ? url : 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60',
    platform: platform,
    duration: defaultType === 'video' ? 60 : null,
    author: `${platform.name} Media`,
    url: url,
    formats: formats
  };
}
