import { jest } from '@jest/globals';
import { StorageBucketRecord } from '../../../../src/models/entities/storageBucketRecord.js';
import { UploadIndexFile } from '../../../../src/models/entities/uploadIndexFile.js';
import { loadUploadIndex, saveUploadIndex } from '../../../../src/services/storage/uploadIndex.js';

describe('uploadIndex', () => {
  const state = {
    read: jest.fn(),
    write: jest.fn(),
  } as any;
  const bucket = StorageBucketRecord.create({ id: 'bucket-1', name: 'assets', createdAt: 'now', raw: {} });

  beforeEach(() => {
    state.read.mockReset();
    state.write.mockReset();
  });

  it('carrega índice existente com bucket correspondente', async () => {
    const existing = { bucketId: 'bucket-1', bucketName: 'assets', files: { 'index.html': {} }, updatedAt: 'prev' };
    state.read.mockResolvedValue(existing);

    const index = await loadUploadIndex(state, bucket);

    expect(index).toBeInstanceOf(UploadIndexFile);
    expect(index.bucketId).toBe('bucket-1');
    expect(index.files).toEqual(existing.files);
  });

  it('cria novo índice quando inexistente', async () => {
    state.read.mockResolvedValue(undefined);

    const index = await loadUploadIndex(state, bucket);

    expect(index).toBeInstanceOf(UploadIndexFile);
    expect(index.bucketId).toBe('bucket-1');
    expect(index.files).toEqual({});
  });

  it('reinicializa índice quando bucketId diverge', async () => {
    state.read.mockResolvedValue({ bucketId: 'other', bucketName: 'old', files: { 'index.html': {} }, updatedAt: 'old' });

    const index = await loadUploadIndex(state, bucket);

    expect(index.bucketId).toBe('bucket-1');
    expect(index.files).toEqual({ 'index.html': {} });
  });

  it('persiste índice sanitizado', async () => {
    const index = UploadIndexFile.create({
      bucketId: 'bucket-1',
      bucketName: 'assets',
      files: { 'index.html': {} },
      updatedAt: 'old',
    });

    await saveUploadIndex(state, bucket, index);

    expect(state.write).toHaveBeenCalledWith(
      'storage/uploads/index-bucket-1.json',
      expect.objectContaining({
        bucketId: 'bucket-1',
        files: { 'index.html': {} },
        updatedAt: expect.any(String),
      }),
    );
  });
});
