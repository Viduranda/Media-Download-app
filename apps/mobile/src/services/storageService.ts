import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { SavedMediaItem, MediaType } from '../types/media';
import { Platform } from 'react-native';

const SAVED_MEDIA_INDEX_FILE = `${FileSystem.documentDirectory}saved_media_index.json`;

/**
 * Request storage & media library permissions on Android & iOS
 */
export async function requestStoragePermissions(): Promise<boolean> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting storage permissions:', error);
    return false;
  }
}

/**
 * Save downloaded media file directly to device gallery / music folder
 */
export async function saveFileToDeviceGallery(
  localUri: string,
  type: MediaType
): Promise<{ success: boolean; assetUri?: string }> {
  try {
    const hasPermission = await requestStoragePermissions();
    if (!hasPermission) {
      console.warn('Storage permission not granted');
      return { success: false };
    }

    if (type === 'video' || type === 'image') {
      const asset = await MediaLibrary.createAssetAsync(localUri);
      let albumName = 'Media Downloader';
      if (type === 'video') albumName = 'Downloaded Videos';
      if (type === 'image') albumName = 'Downloaded Photos';

      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      return { success: true, assetUri: asset.uri };
    } else if (type === 'audio') {
      // Audio/MP3 handling: Saved to App Documents and optionally MediaLibrary
      if (Platform.OS === 'android') {
        const asset = await MediaLibrary.createAssetAsync(localUri);
        const album = await MediaLibrary.getAlbumAsync('Downloaded Audio');
        if (!album) {
          await MediaLibrary.createAlbumAsync('Downloaded Audio', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
        return { success: true, assetUri: asset.uri };
      }
      return { success: true, assetUri: localUri };
    }
  } catch (error) {
    console.error('Failed to save asset to MediaLibrary:', error);
  }
  return { success: false };
}

/**
 * Fetch list of saved media items from local index
 */
export async function getSavedMediaItems(): Promise<SavedMediaItem[]> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(SAVED_MEDIA_INDEX_FILE);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(SAVED_MEDIA_INDEX_FILE);
      return JSON.parse(content) as SavedMediaItem[];
    }
  } catch (error) {
    console.error('Failed to load saved media index:', error);
  }
  return [];
}

/**
 * Register a newly downloaded file into local storage index
 */
export async function registerSavedMediaItem(item: SavedMediaItem): Promise<void> {
  try {
    const existing = await getSavedMediaItems();
    const updated = [item, ...existing.filter(i => i.id !== item.id)];
    await FileSystem.writeAsStringAsync(SAVED_MEDIA_INDEX_FILE, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save media index:', error);
  }
}

/**
 * Delete a media item from device storage and index
 */
export async function deleteSavedMediaItem(id: string, localUri: string): Promise<void> {
  try {
    const existing = await getSavedMediaItems();
    const filtered = existing.filter(item => item.id !== id);
    await FileSystem.writeAsStringAsync(SAVED_MEDIA_INDEX_FILE, JSON.stringify(filtered));

    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    }
  } catch (error) {
    console.error('Failed to delete saved media item:', error);
  }
}
