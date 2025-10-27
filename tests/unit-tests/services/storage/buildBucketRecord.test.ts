import { StorageBucketRecord } from '../../../../src/models/entities/storageBucketRecord.js';
import { buildBucketRecord } from '../../../../src/services/storage/buildBucketRecord.js';

describe('buildBucketRecord', () => {
  it('mapeia payload Azion para StorageBucketRecord', () => {
    const now = new Date().toISOString();
    const result = buildBucketRecord({
      id: 'bucket-1',
      name: 'assets',
      edge_access: 'public',
      description: 'Static assets',
      region: 'global',
      created_at: now,
    });

    expect(result).toBeInstanceOf(StorageBucketRecord);
    expect(result).toMatchObject({
      id: 'bucket-1',
      name: 'assets',
      edgeAccess: 'public',
      description: 'Static assets',
      region: 'global',
      createdAt: now,
      raw: expect.objectContaining({ id: 'bucket-1' }),
    });
  });

  it('define createdAt atual quando payload não possuir valor', () => {
    const result = buildBucketRecord({
      id: 'bucket-2',
      name: 'assets',
      edge_access: 'public',
      description: '',
      region: undefined,
      created_at: undefined,
    });

    expect(typeof result.createdAt).toBe('string');
  });
});
