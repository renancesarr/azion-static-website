import { jest } from '@jest/globals';
import { StorageBucketRecord } from '../../../../src/models/entities/storageBucketRecord.js';
import { lookupBucketByName, lookupBucketById } from '../../../../src/services/storage/lookupBucket.js';

describe('lookupBucket', () => {
  const state = {
    read: jest.fn(),
  } as any;

  beforeEach(() => {
    state.read.mockReset();
  });

  const assets = StorageBucketRecord.create({ id: 'bucket-1', name: 'assets', createdAt: 'now', raw: {} });
  const media = StorageBucketRecord.create({ id: 'bucket-2', name: 'media', createdAt: 'now', raw: {} });
  const sampleState = {
    buckets: {
      assets: assets.toJSON(),
      media: media.toJSON(),
    },
  };

  it('localiza bucket pelo nome', async () => {
    state.read.mockResolvedValue(sampleState);
    const result = await lookupBucketByName(state, 'media');
    expect(result).toBeInstanceOf(StorageBucketRecord);
    expect(result).toMatchObject({ id: 'bucket-2', name: 'media' });
  });

  it('localiza bucket pelo id', async () => {
    state.read.mockResolvedValue(sampleState);
    const result = await lookupBucketById(state, 'bucket-1');
    expect(result).toBeInstanceOf(StorageBucketRecord);
    expect(result).toMatchObject({ id: 'bucket-1', name: 'assets' });
  });
});
