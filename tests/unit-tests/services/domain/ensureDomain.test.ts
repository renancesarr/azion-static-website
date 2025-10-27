import { jest } from '@jest/globals';

const ensureDomainMock = jest.fn();
const createDomainServiceMock = jest.fn(() => ({
  ensureDomain: ensureDomainMock,
}));

let ensureDomain: typeof import('../../../../src/services/domain/ensureDomain.js')['ensureDomain'];

jest.unstable_mockModule('../../../../src/services/domain/domainService.js', () => ({
  createDomainService: createDomainServiceMock,
}));

beforeAll(async () => {
  ({ ensureDomain } = await import('../../../../src/services/domain/ensureDomain.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ensureDomain', () => {
  const input = { name: 'example.com', edgeApplicationId: 'edge-1', isActive: true };

  it('reutiliza domain cacheado', async () => {
    const ensured = { record: { id: 'dom-1' }, created: false };
    ensureDomainMock.mockResolvedValueOnce(ensured);

    await expect(ensureDomain(input)).resolves.toEqual(ensured);
    expect(createDomainServiceMock).toHaveBeenCalledWith({ dependencies: expect.any(Object) });
  });

  it('cria domain via API quando não houver cache', async () => {
    const ensured = { record: { id: 'dom-2' }, created: true };
    ensureDomainMock.mockResolvedValueOnce(ensured);

    await expect(ensureDomain(input)).resolves.toEqual(ensured);
    expect(ensureDomainMock).toHaveBeenCalledWith(input);
  });
});
