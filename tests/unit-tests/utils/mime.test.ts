import { lookupMimeType, inferEncoding } from '../../../src/utils/mime.js';

describe('mime utilities', () => {
  it('returns known mime type for extension', () => {
    expect(lookupMimeType('index.html')).toBe('text/html; charset=utf-8');
    expect(lookupMimeType('image.png')).toBe('image/png');
  });

  it('falls back to octet-stream for unknown extension', () => {
    expect(lookupMimeType('archive.custom')).toBe('application/octet-stream');
  });

  it('infers gzip encoding when filename ends with .gz', () => {
    const result = inferEncoding('styles.css.gz');
    expect(result).toEqual({ contentType: 'text/css; charset=utf-8', contentEncoding: 'gzip' });
  });

  it('infers encoding without gzip extension', () => {
    const result = inferEncoding('script.js');
    expect(result).toEqual({ contentType: 'application/javascript; charset=utf-8', contentEncoding: undefined });
  });
});
