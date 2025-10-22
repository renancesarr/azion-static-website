const MIME_MAP: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.avif': 'image/avif',
};

export function lookupMimeType(fileName: string): string {
  const normalized = fileName.toLowerCase();
  const dotIndex = normalized.lastIndexOf('.');
  if (dotIndex === -1) {
    return 'application/octet-stream';
  }

  const ext = normalized.slice(dotIndex);
  return MIME_MAP[ext] ?? 'application/octet-stream';
}

export function inferEncoding(fileName: string): { contentType: string; contentEncoding?: string } {
  if (fileName.toLowerCase().endsWith('.gz')) {
    const baseName = fileName.slice(0, -3);
    return {
      contentType: lookupMimeType(baseName),
      contentEncoding: 'gzip',
    };
  }

  return {
    contentType: lookupMimeType(fileName),
    contentEncoding: undefined,
  };
}
