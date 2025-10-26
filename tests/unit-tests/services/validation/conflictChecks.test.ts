import { jest } from '@jest/globals';
import { checkBucketConflict } from '../../../../src/services/validation/checkBucketConflict.js';
import { checkDomainConflict } from '../../../../src/services/validation/checkDomainConflict.js';

describe('validation conflict checks', () => {
  const state = {
    read: jest.fn(),
  } as any;
  const deps = { state } as any;

  beforeEach(() => {
    state.read.mockReset();
  });

  it('detecta bucket existente', async () => {
    state.read.mockResolvedValue({ buckets: { bucket: { id: 'bucket-1' } } });

    const result = await checkBucketConflict({ bucketName: 'bucket' }, deps);
    expect(result.ok).toBe(true);
    expect(result.detail).toContain('bucket-1');
  });

  it('detecta domínio inexistente', async () => {
    state.read.mockResolvedValue({ domains: {} });

    const result = await checkDomainConflict({ domainName: 'example.com' }, deps);
    expect(result.ok).toBe(false);
  });
});
