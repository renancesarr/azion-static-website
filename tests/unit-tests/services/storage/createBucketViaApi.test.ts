import { jest } from '@jest/globals';

const persistBucketMock = jest.fn();
const buildBucketRecordMock = jest.fn();
const findBucketByNameApiMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/storage/persistBucket.js', () => ({
  persistBucket: persistBucketMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/buildBucketRecord.js', () => ({
  buildBucketRecord: buildBucketRecordMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/findBucketByNameApi.js', () => ({
  findBucketByNameApi: findBucketByNameApiMock,
}));

type Module = typeof import('../../../../src/services/storage/createBucketViaApi.js');
type HttpModule = typeof import('../../../../src/utils/http.js');

let createBucketViaApi: Module['createBucketViaApi'];
let HttpError: HttpModule['HttpError'];

beforeAll(async () => {
  ({ createBucketViaApi } = await import('../../../../src/services/storage/createBucketViaApi.js'));
  ({ HttpError } = await import('../../../../src/utils/http.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createBucketViaApi', () => {
  const deps = {
    apiBase: 'https://api.azion.com',
    http: {
      request: jest.fn(),
    },
    state: {},
  } as any;

  it('persiste bucket retornado pela API', async () => {
    const payload = { id: 'bucket-1', name: 'assets' };
    deps.http.request.mockResolvedValue({ data: { results: payload } });
    buildBucketRecordMock.mockReturnValue({ id: 'bucket-1' });
    persistBucketMock.mockResolvedValue({ id: 'bucket-1', name: 'assets' });

    const result = await createBucketViaApi({ name: 'assets' }, deps);

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.azion.com/v4/storage/buckets',
      body: {
        name: 'assets',
        edge_access: undefined,
        description: undefined,
        region: undefined,
      },
    });
    expect(buildBucketRecordMock).toHaveBeenCalledWith(payload);
    expect(persistBucketMock).toHaveBeenCalledWith(deps.state, { id: 'bucket-1' });
    expect(result).toEqual({ id: 'bucket-1', name: 'assets' });
  });

  it('reutiliza bucket existente quando API retorna 409', async () => {
    const conflict = new HttpError('conflict', 409, 'Conflict', null, { method: 'POST', url: 'x' });
    deps.http.request.mockRejectedValue(conflict);
    const existing = { id: 'bucket-2', name: 'assets' };
    findBucketByNameApiMock.mockResolvedValue(existing);
    buildBucketRecordMock.mockReturnValue({ id: 'bucket-2' });
    persistBucketMock.mockResolvedValue({ id: 'bucket-2' });

    const result = await createBucketViaApi({ name: 'assets' }, deps);

    expect(findBucketByNameApiMock).toHaveBeenCalledWith('assets', deps);
    expect(result).toEqual({ id: 'bucket-2' });
  });

  it('propaga erro que não seja conflito', async () => {
    const generic = new HttpError('boom', 500, 'Internal', null, { method: 'POST', url: 'x' });
    deps.http.request.mockRejectedValue(generic);

    await expect(createBucketViaApi({ name: 'assets' }, deps)).rejects.toBe(generic);
  });
});
