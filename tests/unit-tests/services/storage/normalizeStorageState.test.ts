import { StorageBucketRecord } from '../../../../src/models/entities/storageBucketRecord.js';
import { normalizeStorageState } from '../../../../src/services/storage/normalizeStorageState.js';

describe('normalizeStorageState', () => {
  it('retorna estrutura vazia quando estado ausente', () => {
    expect(normalizeStorageState()).toEqual({ buckets: {} });
  });

  it('mantém buckets existentes', () => {
    const bucket = StorageBucketRecord.create({ id: '1', name: 'my', createdAt: 'now', raw: {} });
    const result = normalizeStorageState({ buckets: { my: bucket.toJSON() } });
    expect(result.buckets.my).toEqual(bucket.toJSON());
  });
});
