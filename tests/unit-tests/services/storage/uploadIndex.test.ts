import { jest } from '@jest/globals';
import { loadUploadIndex, saveUploadIndex } from '../../../../src/services/storage/uploadIndex.js';

describe('uploadIndex', () => {
  const state = {
    read: jest.fn(),
    write: jest.fn(),
  } as any;
  const bucket = { id: 'bucket-1', name: 'assets' } as any;

  beforeEach(() => {
    state.read.mockReset();
    state.write.mockReset();
  });

  it('carrega índice existente com bucket correspondente', async () => {
    const existing = { bucketId: 'bucket-1', bucketName: 'assets', files: { 'index.html': {} } };
    state.read.mockResolvedValue(existing);

    const index = await loadUploadIndex(state, bucket);

    expect(index).toBe(existing);
  });

  it('cria novo índice quando inexistente', async () => {
    state.read.mockResolvedValue(undefined);

    const index = await loadUploadIndex(state, bucket);

    expect(index.bucketId).toBe('bucket-1');
    expect(index.files).toEqual({});
  });

  it('reinicializa índice quando bucketId diverge', async () => {
    state.read.mockResolvedValue({ bucketId: 'other', bucketName: 'old', files: { 'index.html': {} } });

    const index = await loadUploadIndex(state, bucket);

    expect(index.bucketId).toBe('bucket-1');
    expect(index.files).toEqual({ 'index.html': {} });
  });

  it('persiste índice sanitizado', async () => {
    await saveUploadIndex(state, bucket, { files: { 'index.html': {} } } as any);

    expect(state.write).toHaveBeenCalledWith(
      'storage/uploads/index-bucket-1.json',
      expect.objectContaining({
        bucketId: 'bucket-1',
        files: { 'index.html': {} },
      }),
    );
  });
});
