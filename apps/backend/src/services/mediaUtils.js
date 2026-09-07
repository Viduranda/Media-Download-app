const fetch = require('node-fetch');

/**
 * Proxy stream media file directly to client with correct disposition headers
 */
async function streamMedia(req, res, targetUrl, defaultFilename, contentTypeOverride) {
  try {
    const headRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });

    if (!headRes.ok) {
      return res.status(headRes.status).json({ error: `Upstream media server returned HTTP ${headRes.status}` });
    }

    const contentType = contentTypeOverride || headRes.headers.get('content-type') || 'application/octet-stream';
    const contentLength = headRes.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(defaultFilename)}"`);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    headRes.body.pipe(res);
  } catch (error) {
    console.error('Error streaming media:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream media content from source.' });
    }
  }
}

/**
 * Sanitize filenames for safe storage across Android & iOS file systems
 */
function sanitizeFilename(name, extension) {
  const safeName = name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().substring(0, 80) || 'downloaded_media';
  return `${safeName}.${extension}`;
}

module.exports = {
  streamMedia,
  sanitizeFilename
};
