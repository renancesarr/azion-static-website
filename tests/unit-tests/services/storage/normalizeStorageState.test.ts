import { normalizeStorageState } from '../../../../src/services/storage/normalizeStorageState.js';

describe('normalizeStorageState', () => {
  it('retorna estrutura vazia quando estado ausente', () => {
    expect(normalizeStorageState()).toEqual({ buckets: {} });
  });

  it('mantém buckets existentes', () => {
    const result = normalizeStorageState({ buckets: { my: { id: '1', name: 'my', createdAt: 'now', raw: {} } } });
    expect(result.buckets.my).toEqual({ id: '1', name: 'my', createdAt: 'now', raw: {} });
  });
});
