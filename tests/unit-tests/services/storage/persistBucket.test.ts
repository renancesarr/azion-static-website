import { jest } from '@jest/globals';
import { StorageBucketRecord } from '../../../../src/models/entities/storageBucketRecord.js';
import { persistBucket } from '../../../../src/services/storage/persistBucket.js';

describe('persistBucket', () => {
  const state = {
    read: jest.fn(),
    write: jest.fn(),
  } as any;

  beforeEach(() => {
    state.read.mockReset();
    state.write.mockReset();
  });

  it('adiciona novo bucket ao estado', async () => {
    state.read.mockResolvedValue({ buckets: {} });
    const bucket = StorageBucketRecord.create({
      id: 'bucket-1',
      name: 'assets',
      createdAt: 'now',
      raw: {},
    });

    const result = await persistBucket(state, bucket);

    expect(state.write).toHaveBeenCalledWith('storage/storage_buckets.json', {
      buckets: { assets: bucket.toJSON() },
    });
    expect(result).toBeInstanceOf(StorageBucketRecord);
  });

  it('atualiza bucket existente preservando createdAt', async () => {
    state.read.mockResolvedValue({
      buckets: {
        assets: StorageBucketRecord.create({ id: 'bucket-1', name: 'assets', createdAt: 'before', raw: {} }).toJSON(),
      },
    });
    const bucket = StorageBucketRecord.create({
      id: 'bucket-1',
      name: 'assets',
      createdAt: 'now',
      raw: { test: true },
    });

    const result = await persistBucket(state, bucket);

    expect(result.createdAt).toBe('before');
    expect(result.raw).toEqual({ test: true });
  });
});
