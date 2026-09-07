import * as FileSystem from 'expo-file-system';
import { DownloadTask, MediaFormat, MediaMetadata } from '../types/media';
import { saveFileToDeviceGallery, registerSavedMediaItem } from './storageService';

type Listener = (tasks: DownloadTask[]) => void;

class DownloadManager {
  private tasks: DownloadTask[] = [];
  private downloadResumes: Map<string, FileSystem.DownloadResumable> = new Map();
  private listeners: Set<Listener> = new Set();
  private lastBytesMap: Map<string, { bytes: number; timestamp: number }> = new Map();

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.tasks);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l([...this.tasks]));
  }

  public getTasks(): DownloadTask[] {
    return [...this.tasks];
  }

  /**
   * Start downloading a selected format from media metadata
   */
  public async startDownload(metadata: MediaMetadata, format: MediaFormat): Promise<string> {
    const taskId = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const sanitizedTitle = metadata.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().substring(0, 50) || 'media';
    const filename = `${sanitizedTitle}_${format.resolution.replace(/\s+/g, '')}.${format.ext}`;
    const destinationUri = `${FileSystem.documentDirectory}${filename}`;

    const newTask: DownloadTask = {
      id: taskId,
      title: metadata.title,
      url: metadata.url,
      downloadUrl: format.downloadUrl,
      thumbnail: metadata.thumbnail,
      type: format.type,
      ext: format.ext,
      quality: format.quality,
      platform: metadata.platform.name,
      progress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      speed: '0 KB/s',
      status: 'downloading',
      createdAt: Date.now()
    };

    this.tasks.unshift(newTask);
    this.notify();

    const callback: FileSystem.DownloadProgressCallback = (progressData) => {
      const { totalBytesWritten, totalBytesExpectedToWrite } = progressData;

      // Speed calculation
      const now = Date.now();
      const prevData = this.lastBytesMap.get(taskId) || { bytes: totalBytesWritten, timestamp: now };
      const timeDiffSeconds = (now - prevData.timestamp) / 1000;
      let speedText = '0 KB/s';

      if (timeDiffSeconds >= 0.5) {
        const bytesDiff = totalBytesWritten - prevData.bytes;
        const bytesPerSec = bytesDiff / timeDiffSeconds;
        if (bytesPerSec >= 1024 * 1024) {
          speedText = `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
        } else {
          speedText = `${Math.round(bytesPerSec / 1024)} KB/s`;
        }
        this.lastBytesMap.set(taskId, { bytes: totalBytesWritten, timestamp: now });
      }

      const percent = totalBytesExpectedToWrite > 0
        ? Math.min(100, Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100))
        : 50;

      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1 && this.tasks[taskIndex].status === 'downloading') {
        this.tasks[taskIndex] = {
          ...this.tasks[taskIndex],
          progress: percent,
          downloadedBytes: totalBytesWritten,
          totalBytes: totalBytesExpectedToWrite,
          speed: speedText
        };
        this.notify();
      }
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      format.downloadUrl,
      destinationUri,
      {},
      callback
    );

    this.downloadResumes.set(taskId, downloadResumable);

    try {
      const result = await downloadResumable.downloadAsync();
      if (result && result.uri) {
        // Read file header to verify it is real video/audio media and not an HTML webpage
        const headerSnippet = await FileSystem.readAsStringAsync(result.uri, {
          length: 200,
          encoding: FileSystem.EncodingType.UTF8
        }).catch(() => '');

        if (headerSnippet.includes('<!DOCTYPE') || headerSnippet.includes('<html') || headerSnippet.includes('<head')) {
          await FileSystem.deleteAsync(result.uri, { idempotent: true });
          throw new Error('Received HTML web page instead of media video bytes. Please ensure media URL is direct or backend API is active.');
        }

        // Mark download as complete
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          this.tasks[taskIndex].status = 'completed';
          this.tasks[taskIndex].progress = 100;
          this.tasks[taskIndex].localUri = result.uri;

          // Save directly to Device Gallery / Storage
          const saveResult = await saveFileToDeviceGallery(result.uri, format.type);
          this.tasks[taskIndex].savedToGallery = saveResult.success;

          // Register in offline media catalog
          await registerSavedMediaItem({
            id: taskId,
            filename: filename,
            localUri: result.uri,
            type: format.type,
            fileSize: this.tasks[taskIndex].totalBytes || 1024 * 1024,
            thumbnail: metadata.thumbnail,
            platform: metadata.platform.name,
            createdAt: Date.now()
          });

          this.notify();
        }
      }
    } catch (error: any) {
      console.error(`Download failed for ${filename}:`, error);
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex].status = 'failed';
        this.tasks[taskIndex].errorMessage = error?.message || 'Download failed';
        this.notify();
      }
    }

    return taskId;
  }

  /**
   * Pause an active download
   */
  public async pauseDownload(taskId: string): Promise<void> {
    const downloadResumable = this.downloadResumes.get(taskId);
    if (downloadResumable) {
      try {
        await downloadResumable.pauseAsync();
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          this.tasks[taskIndex].status = 'paused';
          this.notify();
        }
      } catch (e) {
        console.error('Failed to pause download:', e);
      }
    }
  }

  /**
   * Cancel and remove a download task
   */
  public async cancelDownload(taskId: string): Promise<void> {
    const downloadResumable = this.downloadResumes.get(taskId);
    if (downloadResumable) {
      try {
        await downloadResumable.cancelAsync();
      } catch (e) {
        // ignore
      }
      this.downloadResumes.delete(taskId);
    }
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.notify();
  }
}

export const downloadManager = new DownloadManager();
