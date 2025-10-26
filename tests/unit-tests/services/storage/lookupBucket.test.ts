import { lookupBucketByName, lookupBucketById } from '../../../../src/services/storage/lookupBucket.js';

describe('lookupBucket', () => {
  const state = {
    read: jest.fn(),
  } as any;

  beforeEach(() => {
    state.read.mockReset();
  });

  const sampleState = {
    buckets: {
      assets: { id: 'bucket-1', name: 'assets' },
      media: { id: 'bucket-2', name: 'media' },
    },
  };

  it('localiza bucket pelo nome', async () => {
    state.read.mockResolvedValue(sampleState);
    const result = await lookupBucketByName(state, 'media');
    expect(result).toEqual({ id: 'bucket-2', name: 'media' });
  });

  it('localiza bucket pelo id', async () => {
    state.read.mockResolvedValue(sampleState);
    const result = await lookupBucketById(state, 'bucket-1');
    expect(result).toEqual({ id: 'bucket-1', name: 'assets' });
  });
});
