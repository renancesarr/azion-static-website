import { jest } from '@jest/globals';

const findDomainByNameMock = jest.fn();
const createDomainViaApiMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/domain/findDomainByName.js', () => ({
  findDomainByName: findDomainByNameMock,
}));

jest.unstable_mockModule('../../../../src/services/domain/createDomainViaApi.js', () => ({
  createDomainViaApi: createDomainViaApiMock,
}));

let ensureDomain: typeof import('../../../../src/services/domain/ensureDomain.js')['ensureDomain'];

beforeAll(async () => {
  ({ ensureDomain } = await import('../../../../src/services/domain/ensureDomain.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ensureDomain', () => {
  const input = { name: 'example.com', edgeApplicationId: 'edge-1', isActive: true };

  it('reutiliza domain cacheado', async () => {
    const cached = { id: 'dom-1' };
    findDomainByNameMock.mockResolvedValue(cached);

    const result = await ensureDomain(input);

    expect(result).toEqual({ record: cached, created: false });
    expect(createDomainViaApiMock).not.toHaveBeenCalled();
  });

  it('cria domain via API quando não houver cache', async () => {
    const created = { id: 'dom-2' };
    findDomainByNameMock.mockResolvedValue(undefined);
    createDomainViaApiMock.mockResolvedValue(created);

    const result = await ensureDomain(input);

    expect(createDomainViaApiMock).toHaveBeenCalledWith(input, expect.any(Object));
    expect(result).toEqual({ record: created, created: true });
  });
});
