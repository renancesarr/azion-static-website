import { jest } from '@jest/globals';
import { loadFirstUploadIndex } from '../../../../src/services/validation/loadFirstUploadIndex.js';

describe('loadFirstUploadIndex', () => {
  const state = {
    read: jest.fn(),
  } as any;

  beforeEach(() => {
    state.read.mockReset();
  });

  it('retorna undefined quando não há buckets', async () => {
    state.read.mockResolvedValueOnce(undefined);

    const result = await loadFirstUploadIndex(state);
    expect(result).toBeUndefined();
  });

  it('retorna índice do primeiro bucket', async () => {
    state.read
      .mockResolvedValueOnce({ buckets: { bucket: { id: 'bucket-1' } } })
      .mockResolvedValueOnce({ bucketId: 'bucket-1', files: { 'index.html': { hash: '1' } } });

    const result = await loadFirstUploadIndex(state);

    expect(result).toEqual({ bucketId: 'bucket-1', path: 'storage/uploads/index-bucket-1.json', file: { bucketId: 'bucket-1', files: { 'index.html': { hash: '1' } } } });
  });
});
