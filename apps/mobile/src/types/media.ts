export type MediaType = 'video' | 'audio' | 'image';

export interface PlatformInfo {
  name: string;
  id: 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'pinterest' | 'direct';
  icon: string;
}

export interface MediaFormat {
  id: string;
  quality: string;
  resolution: string;
  ext: string;
  type: MediaType;
  downloadUrl: string;
  fileSize?: number | null;
}

export interface MediaMetadata {
  title: string;
  thumbnail?: string | null;
  platform: PlatformInfo;
  duration?: number | null;
  author?: string;
  url: string;
  formats: MediaFormat[];
}

export type DownloadStatus = 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';

export interface DownloadTask {
  id: string;
  title: string;
  url: string;
  downloadUrl: string;
  thumbnail?: string | null;
  type: MediaType;
  ext: string;
  quality: string;
  platform: string;
  progress: number; // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  speed: string; // e.g. "1.5 MB/s"
  status: DownloadStatus;
  localUri?: string;
  savedToGallery?: boolean;
  createdAt: number;
  errorMessage?: string;
}

export interface SavedMediaItem {
  id: string;
  filename: string;
  localUri: string;
  type: MediaType;
  fileSize: number;
  thumbnail?: string | null;
  platform: string;
  createdAt: number;
}
