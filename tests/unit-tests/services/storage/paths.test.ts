import {
  sanitizeFileSegment,
  uploadIndexRelativePath,
  uploadLogRelativePath,
} from '../../../../src/services/storage/paths.js';

describe('storage paths', () => {
  it('sanitiza segmentos substituindo caracteres inválidos', () => {
    expect(sanitizeFileSegment('2024:01:01T00:00:00Z')).toBe('2024-01-01T00-00-00Z');
    expect(sanitizeFileSegment('abc?')).toBe('abc_');
  });

  it('monta caminho do índice com fallback para nome', () => {
    expect(uploadIndexRelativePath({ id: 'bucket-1', name: 'assets' })).toBe('storage/uploads/index-bucket-1.json');
    expect(uploadIndexRelativePath({ id: '', name: 'assets' })).toBe('storage/uploads/index-assets.json');
  });

  it('monta caminho do log de upload', () => {
    expect(uploadLogRelativePath('2024-01-01T00:00:00Z')).toBe('storage/uploads/logs/upload-2024-01-01T00-00-00Z.json');
  });
});
