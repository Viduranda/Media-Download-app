const express = require('express');
const router = express.Router();
const { streamMedia, sanitizeFilename } = require('../services/mediaUtils');

/**
 * GET /api/download?url=...&filename=...&type=video|audio|image
 * Downloads / streams media with disposition headers
 */
router.get('/', async (req, res) => {
  try {
    const { url, filename, type, ext } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Target URL is required for download.' });
    }

    const fileExt = ext || (type === 'audio' ? 'mp3' : type === 'image' ? 'jpg' : 'mp4');
    const safeFilename = sanitizeFilename(filename || 'downloaded_media', fileExt);

    let mimeType = 'application/octet-stream';
    if (type === 'video') mimeType = 'video/mp4';
    if (type === 'audio') mimeType = 'audio/mpeg';
    if (type === 'image') mimeType = 'image/jpeg';

    await streamMedia(req, res, url, safeFilename, mimeType);
  } catch (error) {
    console.error('Download stream error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Download stream failed.' });
    }
  }
});

module.exports = router;
