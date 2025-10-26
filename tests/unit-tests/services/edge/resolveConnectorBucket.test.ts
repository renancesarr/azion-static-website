import { jest } from '@jest/globals';

const resolveBucketReferenceMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/storage/index.js', () => ({
  resolveBucketReference: resolveBucketReferenceMock,
}));

let resolveConnectorBucket: typeof import('../../../../src/services/edge/resolveConnectorBucket.js')['resolveConnectorBucket'];

beforeAll(async () => {
  ({ resolveConnectorBucket } = await import('../../../../src/services/edge/resolveConnectorBucket.js'));
});

beforeEach(() => {
  resolveBucketReferenceMock.mockReset();
});

describe('resolveConnectorBucket', () => {
  it('delegates resolução ao módulo de storage', async () => {
    resolveBucketReferenceMock.mockResolvedValue({ id: 'bucket-1' });

    const bucket = await resolveConnectorBucket({ bucketId: 'bucket-1' });

    expect(resolveBucketReferenceMock).toHaveBeenCalledWith({ bucketId: 'bucket-1', bucketName: undefined });
    expect(bucket).toEqual({ id: 'bucket-1' });
  });

  it('aceita referência por nome', async () => {
    resolveBucketReferenceMock.mockResolvedValueOnce({ id: 'bucket-2', name: 'assets' });

    const bucket = await resolveConnectorBucket({ bucketName: 'assets' });

    expect(resolveBucketReferenceMock).toHaveBeenCalledWith({ bucketId: undefined, bucketName: 'assets' });
    expect(bucket).toEqual({ id: 'bucket-2', name: 'assets' });
  });

  it('lança erro quando bucket não é informado', async () => {
    await expect(resolveConnectorBucket({})).rejects.toThrow('Bucket não informado.');
  });
});
