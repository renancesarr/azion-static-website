import { jest } from '@jest/globals';

const persistDomainMock = jest.fn();
const buildDomainRecordMock = jest.fn();
const findDomainByNameApiMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/domain/persistDomain.js', () => ({
  persistDomain: persistDomainMock,
}));

jest.unstable_mockModule('../../../../src/services/domain/buildDomainRecord.js', () => ({
  buildDomainRecord: buildDomainRecordMock,
}));

jest.unstable_mockModule('../../../../src/services/domain/findDomainByNameApi.js', () => ({
  findDomainByNameApi: findDomainByNameApiMock,
}));

let createDomainViaApi: typeof import('../../../../src/services/domain/createDomainViaApi.js')['createDomainViaApi'];

beforeAll(async () => {
  ({ createDomainViaApi } = await import('../../../../src/services/domain/createDomainViaApi.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createDomainViaApi', () => {
  const deps = {
    apiBase: 'https://api.azion.com',
    http: jest.fn(),
  };

  it('cria domain e persiste registro quando API responde sucesso', async () => {
    const payload = {
      id: 'dom-1',
      name: 'example.com',
      edge_application_id: 'edge-1',
      active: true,
      cname: 'example.com.azioncdn.net',
      cnames: [],
    };
    deps.http.mockResolvedValue({ data: { results: payload } });
    buildDomainRecordMock.mockReturnValue({ id: 'dom-1' });
    persistDomainMock.mockResolvedValue({ id: 'dom-1' });

    const result = await createDomainViaApi(
      { name: 'example.com', edgeApplicationId: 'edge-1', isActive: true },
      deps,
    );

    expect(deps.http).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.azion.com/v4/domains',
      body: {
        name: 'example.com',
        edge_application_id: 'edge-1',
        is_active: true,
        cname: undefined,
      },
    });
    expect(buildDomainRecordMock).toHaveBeenCalledWith(payload);
    expect(persistDomainMock).toHaveBeenCalledWith({ id: 'dom-1' });
    expect(result).toEqual({ id: 'dom-1' });
  });

  it('reaproveita domain existente quando API retorna 409', async () => {
    const conflictError = Object.assign(new Error('conflict'), { status: 409 });
    deps.http.mockRejectedValue(conflictError);
    const existing = {
      id: 'dom-2',
      name: 'example.com',
      edge_application_id: 'edge-2',
      active: true,
      cname: 'example.com.azioncdn.net',
      cnames: [],
    };
    findDomainByNameApiMock.mockResolvedValue(existing);
    buildDomainRecordMock.mockReturnValue({ id: 'dom-2' });
    persistDomainMock.mockResolvedValue({ id: 'dom-2' });

    const result = await createDomainViaApi(
      { name: 'example.com', edgeApplicationId: 'edge-2', isActive: true },
      deps,
    );

    expect(findDomainByNameApiMock).toHaveBeenCalledWith('example.com', deps);
    expect(persistDomainMock).toHaveBeenCalledWith({ id: 'dom-2' });
    expect(result).toEqual({ id: 'dom-2' });
  });

  it('propaga erro diferente de conflito', async () => {
    const genericError = Object.assign(new Error('boom'), { status: 500 });
    deps.http.mockRejectedValue(genericError);
    findDomainByNameApiMock.mockResolvedValue(undefined);

    await expect(
      createDomainViaApi({ name: 'example.com', edgeApplicationId: 'edge-1', isActive: true }, deps),
    ).rejects.toBe(genericError);
  });
});
