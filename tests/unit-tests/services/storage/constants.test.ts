import { STORAGE_STATE_FILE, UPLOAD_STATE_DIR, UPLOAD_LOG_DIR } from '../../../../src/services/storage/constants.js';

describe('storage constants', () => {
  it('expõe caminho padrão do estado', () => {
    expect(STORAGE_STATE_FILE).toBe('storage/storage_buckets.json');
  });

  it('define diretórios de upload', () => {
    expect(UPLOAD_STATE_DIR).toBe('storage/uploads');
    expect(UPLOAD_LOG_DIR).toBe('storage/uploads/logs');
  });
});
