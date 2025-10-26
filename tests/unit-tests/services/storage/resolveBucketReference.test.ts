import { jest } from '@jest/globals';

const lookupBucketByIdMock = jest.fn();
const lookupBucketByNameMock = jest.fn();
const fetchBucketByIdApiMock = jest.fn();
const findBucketByNameApiMock = jest.fn();
const persistBucketMock = jest.fn();
const buildBucketRecordMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/storage/lookupBucket.js', () => ({
  lookupBucketById: lookupBucketByIdMock,
  lookupBucketByName: lookupBucketByNameMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/fetchBucketByIdApi.js', () => ({
  fetchBucketByIdApi: fetchBucketByIdApiMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/findBucketByNameApi.js', () => ({
  findBucketByNameApi: findBucketByNameApiMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/persistBucket.js', () => ({
  persistBucket: persistBucketMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/buildBucketRecord.js', () => ({
  buildBucketRecord: buildBucketRecordMock,
}));

let resolveBucketReference: typeof import('../../../../src/services/storage/resolveBucketReference.js')['resolveBucketReference'];

beforeAll(async () => {
  ({ resolveBucketReference } = await import('../../../../src/services/storage/resolveBucketReference.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

const deps = { state: {} } as any;

describe('resolveBucketReference', () => {
  it('retorna bucket cacheado pelo id', async () => {
    lookupBucketByIdMock.mockResolvedValue({ id: 'bucket-1' });

    const bucket = await resolveBucketReference({ bucketId: 'bucket-1' }, deps);

    expect(bucket).toEqual({ id: 'bucket-1' });
  });

  it('busca bucket na API pelo id quando não está em cache', async () => {
    lookupBucketByIdMock.mockResolvedValue(undefined);
    fetchBucketByIdApiMock.mockResolvedValue({ id: 'bucket-1', name: 'assets' });
    buildBucketRecordMock.mockReturnValue({ id: 'bucket-1', name: 'assets' });
    persistBucketMock.mockResolvedValue({ id: 'bucket-1', name: 'assets' });

    const bucket = await resolveBucketReference({ bucketId: 'bucket-1' }, deps);

    expect(fetchBucketByIdApiMock).toHaveBeenCalledWith('bucket-1', deps);
    expect(bucket).toEqual({ id: 'bucket-1', name: 'assets' });
  });

  it('retorna bucket cacheado por nome', async () => {
    lookupBucketByNameMock.mockResolvedValue({ id: 'bucket-1', name: 'assets' });

    const bucket = await resolveBucketReference({ bucketName: 'assets' }, deps);

    expect(bucket.name).toBe('assets');
  });

  it('busca bucket por nome na API quando necessário', async () => {
    lookupBucketByNameMock.mockResolvedValueOnce(undefined);
    findBucketByNameApiMock.mockResolvedValue({ id: 'bucket-3', name: 'media' });
    buildBucketRecordMock.mockReturnValue({ id: 'bucket-3', name: 'media' });
    persistBucketMock.mockResolvedValue({ id: 'bucket-3', name: 'media' });

    const bucket = await resolveBucketReference({ bucketName: 'media' }, deps);

    expect(findBucketByNameApiMock).toHaveBeenCalledWith('media', deps);
    expect(bucket).toEqual({ id: 'bucket-3', name: 'media' });
  });

  it('lança erro quando referência não localizada', async () => {
    lookupBucketByIdMock.mockResolvedValue(undefined);
    fetchBucketByIdApiMock.mockResolvedValue(undefined);

    await expect(resolveBucketReference({ bucketId: 'missing' }, deps)).rejects.toThrow(
      'Bucket com id missing não localizado na API Azion.',
    );
  });

  it('dispara erro quando referência ausente', async () => {
    await expect(resolveBucketReference({}, deps)).rejects.toThrow('Referência de bucket ausente.');
  });
});
