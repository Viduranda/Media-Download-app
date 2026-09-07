const express = require('express');
const router = express.Router();
const { extractMediaInfo } = require('../services/ytdlpService');

/**
 * POST /api/extract
 * Body: { url: "https://..." }
 * Returns metadata, platform details, thumbnail, formats (video resolutions, MP3, images)
 */
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
      return res.status(400).json({ error: 'Valid HTTP/HTTPS URL is required.' });
    }

    const cleanUrl = url.trim();
    const mediaInfo = await extractMediaInfo(cleanUrl);
    return res.json({ success: true, data: mediaInfo });
  } catch (error) {
    console.error('Error during media extraction:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract media details from provided URL.'
    });
  }
});

module.exports = router;
