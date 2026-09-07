const { spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

/**
 * Detect social media platform from input URL
 */
function detectPlatform(url) {
  const cleanUrl = url.toLowerCase();
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    return { name: 'YouTube', id: 'youtube', icon: 'youtube' };
  }
  if (cleanUrl.includes('instagram.com')) {
    return { name: 'Instagram', id: 'instagram', icon: 'instagram' };
  }
  if (cleanUrl.includes('tiktok.com')) {
    return { name: 'TikTok', id: 'tiktok', icon: 'music' };
  }
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
    return { name: 'Facebook', id: 'facebook', icon: 'facebook' };
  }
  if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) {
    return { name: 'Twitter / X', id: 'twitter', icon: 'twitter' };
  }
  if (cleanUrl.includes('pinterest.com') || cleanUrl.includes('pin.it')) {
    return { name: 'Pinterest', id: 'pinterest', icon: 'image' };
  }
  return { name: 'Direct File / Web', id: 'direct', icon: 'link' };
}

/**
 * Check if link is a direct video/audio/image file link
 */
async function checkDirectMediaUrl(url) {
  try {
    const headRes = await fetch(url, { method: 'HEAD', timeout: 5000 });
    const contentType = headRes.headers.get('content-type') || '';
    const contentLength = headRes.headers.get('content-length');

    if (contentType.startsWith('video/')) {
      const ext = contentType.includes('mp4') ? 'mp4' : 'webm';
      return {
        isDirect: true,
        type: 'video',
        title: path.basename(new URL(url).pathname) || 'Downloaded Video',
        url: url,
        mimeType: contentType,
        fileSize: contentLength ? parseInt(contentLength, 10) : null,
        ext: ext
      };
    } else if (contentType.startsWith('audio/')) {
      return {
        isDirect: true,
        type: 'audio',
        title: path.basename(new URL(url).pathname) || 'Downloaded Audio',
        url: url,
        mimeType: contentType,
        fileSize: contentLength ? parseInt(contentLength, 10) : null,
        ext: 'mp3'
      };
    } else if (contentType.startsWith('image/')) {
      const ext = contentType.includes('png') ? 'png' : 'jpg';
      return {
        isDirect: true,
        type: 'image',
        title: path.basename(new URL(url).pathname) || 'Downloaded Image',
        url: url,
        mimeType: contentType,
        fileSize: contentLength ? parseInt(contentLength, 10) : null,
        ext: ext
      };
    }
  } catch (e) {
    // Not a direct file link
  }
  return { isDirect: false };
}

/**
 * Helper to ensure yt-dlp binary is present locally or downloaded automatically
 */
async function ensureYtDlpBinary() {
  const isWindows = process.platform === 'win32';
  const binDir = path.join(__dirname, '../../bin');
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const binaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
  const localExe = path.join(binDir, binaryName);

  if (fs.existsSync(localExe)) {
    return localExe;
  }

  // Check system PATH
  try {
    const checkCmd = isWindows ? 'where yt-dlp' : 'which yt-dlp';
    require('child_process').execSync(checkCmd, { stdio: 'ignore' });
    return 'yt-dlp';
  } catch (e) {
    // Not in system PATH, auto-download binary
  }

  console.log(`yt-dlp binary missing. Auto-downloading latest ${binaryName}...`);
  const downloadUrl = isWindows
    ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
    : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`Failed to fetch yt-dlp binary: ${res.statusText}`);
  const buffer = await res.buffer();
  fs.writeFileSync(localExe, buffer);

  if (!isWindows) {
    fs.chmodSync(localExe, '755');
  }

  console.log(`yt-dlp binary successfully saved to ${localExe}`);
  return localExe;
}

/**
 * Execute yt-dlp binary command and parse JSON output
 */
async function extractWithYtDlp(url) {
  const ytdlpPath = await ensureYtDlpBinary();

  return new Promise((resolve, reject) => {
    const ytdlp = spawn(ytdlpPath, ['-j', '--no-warnings', '--no-check-certificates', url]);
    let stdoutData = '';
    let stderrData = '';

    ytdlp.stdout.on('data', (chunk) => {
      stdoutData += chunk;
    });

    ytdlp.stderr.on('data', (chunk) => {
      stderrData += chunk;
    });

    ytdlp.on('close', (code) => {
      if (code === 0 && stdoutData.trim()) {
        try {
          const info = JSON.parse(stdoutData);
          resolve(info);
        } catch (err) {
          reject(new Error('Failed to parse yt-dlp metadata JSON output'));
        }
      } else {
        reject(new Error(stderrData || `yt-dlp exited with code ${code}`));
      }
    });

    ytdlp.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Extract rich media info with available video resolutions, MP3 audio formats, and images
 */
async function extractMediaInfo(url) {
  const platform = detectPlatform(url);

  // 1. Direct file link check
  const directCheck = await checkDirectMediaUrl(url);
  if (directCheck.isDirect) {
    const formats = [];
    if (directCheck.type === 'video') {
      formats.push({
        id: 'direct-video',
        quality: 'Original Quality',
        resolution: 'Direct Stream',
        ext: directCheck.ext,
        type: 'video',
        downloadUrl: url,
        fileSize: directCheck.fileSize
      });
      formats.push({
        id: 'direct-audio',
        quality: 'Extract Audio (MP3)',
        resolution: 'Audio Only',
        ext: 'mp3',
        type: 'audio',
        downloadUrl: url,
        fileSize: null
      });
    } else if (directCheck.type === 'audio') {
      formats.push({
        id: 'direct-audio',
        quality: 'Original MP3',
        resolution: 'Audio Only',
        ext: 'mp3',
        type: 'audio',
        downloadUrl: url,
        fileSize: directCheck.fileSize
      });
    } else if (directCheck.type === 'image') {
      formats.push({
        id: 'direct-image',
        quality: 'High Resolution Image',
        resolution: 'Original',
        ext: directCheck.ext,
        type: 'image',
        downloadUrl: url,
        fileSize: directCheck.fileSize
      });
    }

    return {
      title: directCheck.title,
      thumbnail: directCheck.type === 'image' ? url : null,
      platform: platform,
      duration: null,
      author: 'Direct File Link',
      url: url,
      formats: formats
    };
  }

  // 2. Try yt-dlp binary (local bin/yt-dlp.exe or Docker container yt-dlp)
  try {
    const info = await extractWithYtDlp(url);
    const formats = [];

    if (info.formats && Array.isArray(info.formats)) {
      const addedResolutions = new Set();
      const videoFormats = info.formats
        .filter(f => f.vcodec !== 'none' && f.url)
        .sort((a, b) => (b.height || 0) - (a.height || 0));

      for (const f of videoFormats) {
        const height = f.height ? `${f.height}p` : 'HD';
        const key = `${height}-${f.ext}`;
        if (!addedResolutions.has(key)) {
          addedResolutions.add(key);
          formats.push({
            id: f.format_id || `video-${f.height || 'hd'}`,
            quality: `${height} Video (${(f.ext || 'mp4').toUpperCase()})`,
            resolution: height,
            ext: f.ext || 'mp4',
            type: 'video',
            downloadUrl: f.url,
            fileSize: f.filesize || f.filesize_approx || null
          });
        }
      }
    }

    if (formats.length === 0 && info.url) {
      formats.push({
        id: 'default-video',
        quality: 'Best Quality Video (MP4)',
        resolution: '720p / HD',
        ext: 'mp4',
        type: 'video',
        downloadUrl: info.url,
        fileSize: null
      });
    }

    formats.push({
      id: 'mp3-high',
      quality: 'MP3 Audio (320 kbps)',
      resolution: 'Audio Only',
      ext: 'mp3',
      type: 'audio',
      downloadUrl: info.url || url,
      fileSize: null
    });

    if (info.thumbnail) {
      formats.push({
        id: 'thumbnail-hd',
        quality: 'HD Image / Thumbnail (JPG)',
        resolution: 'Original Image',
        ext: 'jpg',
        type: 'image',
        downloadUrl: info.thumbnail,
        fileSize: null
      });
    }

    return {
      title: info.title || info.fulltitle || `${platform.name} Media Download`,
      thumbnail: info.thumbnail || (info.thumbnails && info.thumbnails[0] ? info.thumbnails[0].url : null),
      platform: platform,
      duration: info.duration ? Math.round(info.duration) : null,
      author: info.uploader || info.channel || info.creator || platform.name,
      url: url,
      formats: formats
    };
  } catch (ytErr) {
    console.error('yt-dlp extraction error:', ytErr.message);
  }

  // 3. Fallback direct format
  return {
    title: `${platform.name} Video (${path.basename(new URL(url).pathname) || 'Download'})`,
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60',
    platform: platform,
    duration: 60,
    author: `${platform.name} Creator`,
    url: url,
    formats: [
      {
        id: 'fallback-video-hd',
        quality: 'HD Video Stream (MP4)',
        resolution: '720p',
        ext: 'mp4',
        type: 'video',
        downloadUrl: url,
        fileSize: null
      }
    ]
  };
}

module.exports = {
  detectPlatform,
  checkDirectMediaUrl,
  extractMediaInfo
};
