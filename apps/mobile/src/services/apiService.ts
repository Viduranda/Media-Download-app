import { MediaMetadata, MediaFormat, PlatformInfo } from '../types/media';

// Configurable PC Local IP / Deployed Server URL
export const BACKEND_API_URL = 'http://172.16.74.21:4000/api';

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
 * Extract media information from URL using local server, public cloud engine, or direct URL parser
 */
export async function extractMedia(url: string): Promise<MediaMetadata> {
  const cleanUrl = url.trim();
  const platform = getPlatformFromUrl(cleanUrl);

  // 1. Try local / custom backend API server first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${BACKEND_API_URL}/extract`, {
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
    console.warn('Backend server unreachable at BACKEND_API_URL:', error);
  }

  // 2. Fallback direct stream format
  return generateClientFallbackMetadata(cleanUrl, platform);
}

/**
 * Generate fallback metadata for direct file links or proxy stream links
 */
function generateClientFallbackMetadata(url: string, platform: PlatformInfo): MediaMetadata {
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

  // Route download through backend proxy stream endpoint
  const proxyDownloadUrl = `${BACKEND_API_URL}/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filenameFromUrl)}&type=${defaultType}&ext=${defaultExt}`;

  const formats: MediaFormat[] = [];

  if (defaultType === 'video') {
    formats.push({
      id: 'video-direct',
      quality: 'Video Stream (MP4)',
      resolution: '720p / HD',
      ext: 'mp4',
      type: 'video',
      downloadUrl: proxyDownloadUrl
    });
    formats.push({
      id: 'audio-direct',
      quality: 'Audio Stream (MP3)',
      resolution: 'Audio Only',
      ext: 'mp3',
      type: 'audio',
      downloadUrl: `${BACKEND_API_URL}/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filenameFromUrl)}&type=audio&ext=mp3`
    });
  } else if (defaultType === 'audio') {
    formats.push({
      id: 'mp3-direct',
      quality: 'Audio File (MP3)',
      resolution: 'Audio Only',
      ext: 'mp3',
      type: 'audio',
      downloadUrl: proxyDownloadUrl
    });
  } else if (defaultType === 'image') {
    formats.push({
      id: 'image-direct',
      quality: 'High Resolution Photo',
      resolution: 'Original Quality',
      ext: defaultExt,
      type: 'image',
      downloadUrl: proxyDownloadUrl
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
