import { jest } from '@jest/globals';

const lookupBucketByNameMock = jest.fn();
const createBucketViaApiMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/storage/lookupBucket.js', () => ({
  lookupBucketByName: lookupBucketByNameMock,
  lookupBucketById: jest.fn(),
}));

jest.unstable_mockModule('../../../../src/services/storage/createBucketViaApi.js', () => ({
  createBucketViaApi: createBucketViaApiMock,
}));

type EnsureBucketModule = typeof import('../../../../src/services/storage/ensureBucket.js');

let ensureBucket: EnsureBucketModule['ensureBucket'];

beforeAll(async () => {
  ({ ensureBucket } = await import('../../../../src/services/storage/ensureBucket.js'));
});

afterEach(() => {
  lookupBucketByNameMock.mockReset();
  createBucketViaApiMock.mockReset();
});

describe('ensureBucket', () => {
  it('retorna bucket existente sem recriar', async () => {
    const existing = { id: '123', name: 'bucket-existing' };
    lookupBucketByNameMock.mockResolvedValue(existing);

    const result = await ensureBucket({ name: 'bucket-existing' });

    expect(result).toEqual({ record: existing, created: false });
    expect(lookupBucketByNameMock).toHaveBeenCalledTimes(1);
    expect(createBucketViaApiMock).not.toHaveBeenCalled();
  });

  it('cria bucket quando inexistente', async () => {
    const created = { id: 'abc', name: 'new-bucket' };
    lookupBucketByNameMock.mockResolvedValue(undefined);
    createBucketViaApiMock.mockResolvedValue(created);

    const result = await ensureBucket({ name: 'new-bucket' });

    expect(result).toEqual({ record: created, created: true });
    expect(lookupBucketByNameMock).toHaveBeenCalledTimes(1);
    expect(createBucketViaApiMock).toHaveBeenCalledWith({ name: 'new-bucket' }, expect.any(Object));
  });
});
