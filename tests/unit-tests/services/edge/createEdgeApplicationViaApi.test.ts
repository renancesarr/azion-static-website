import { jest } from '@jest/globals';

const persistEdgeApplicationMock = jest.fn();
const buildEdgeApplicationRecordMock = jest.fn();
const findEdgeApplicationByNameApiMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/edge/persistEdgeApplication.js', () => ({
  persistEdgeApplication: persistEdgeApplicationMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/buildEdgeApplicationRecord.js', () => ({
  buildEdgeApplicationRecord: buildEdgeApplicationRecordMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/findEdgeApplicationByNameApi.js', () => ({
  findEdgeApplicationByNameApi: findEdgeApplicationByNameApiMock,
}));

type Module = typeof import('../../../../src/services/edge/createEdgeApplicationViaApi.js');
type HttpModule = typeof import('../../../../src/utils/http.js');

let createEdgeApplicationViaApi: Module['createEdgeApplicationViaApi'];
let HttpError: HttpModule['HttpError'];

beforeAll(async () => {
  ({ createEdgeApplicationViaApi } = await import('../../../../src/services/edge/createEdgeApplicationViaApi.js'));
  ({ HttpError } = await import('../../../../src/utils/http.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createEdgeApplicationViaApi', () => {
  const deps = {
    apiBase: 'https://api.azion.com',
    http: {
      request: jest.fn(),
    },
    state: {},
  } as any;

  it('persiste edge application criada', async () => {
    const payload = { id: 'app-1' };
    deps.http.request.mockResolvedValue({ data: { results: payload } });
    buildEdgeApplicationRecordMock.mockReturnValue({ id: 'app-1' });
    persistEdgeApplicationMock.mockResolvedValue({ id: 'app-1' });

    const result = await createEdgeApplicationViaApi({ name: 'edge-app', enableWaf: true } as any, deps);

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.azion.com/v4/edge_applications',
      body: expect.objectContaining({ name: 'edge-app', waf: { active: true } }),
    });
    expect(result).toEqual({ id: 'app-1' });
  });

  it('reaproveita edge application existente em caso de conflito', async () => {
    deps.http.request.mockRejectedValue(new HttpError('conflict', 409, 'Conflict', null, { method: 'POST', url: 'x' }));
    findEdgeApplicationByNameApiMock.mockResolvedValue({ id: 'app-2' });
    buildEdgeApplicationRecordMock.mockReturnValue({ id: 'app-2' });
    persistEdgeApplicationMock.mockResolvedValue({ id: 'app-2' });

    const result = await createEdgeApplicationViaApi({ name: 'edge-app' } as any, deps);

    expect(findEdgeApplicationByNameApiMock).toHaveBeenCalledWith('edge-app', deps);
    expect(result).toEqual({ id: 'app-2' });
  });

  it('propaga erros não tratados', async () => {
    const error = new HttpError('boom', 500, 'Internal', null, { method: 'POST', url: 'x' });
    deps.http.request.mockRejectedValue(error);

    await expect(createEdgeApplicationViaApi({ name: 'edge-app' } as any, deps)).rejects.toBe(error);
  });
});
