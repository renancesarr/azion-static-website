import { findDomainByNameApi } from '../../../../src/services/domain/findDomainByNameApi.js';

describe('findDomainByNameApi', () => {
  const deps = {
    apiBase: 'https://api.azion.com',
    http: jest.fn(),
  };

  beforeEach(() => {
    deps.http.mockReset();
  });

  it('consulta API e retorna domínio correspondente', async () => {
    const domain = { id: 'dom-1', name: 'example.com' };
    deps.http.mockResolvedValue({ data: { results: [domain] } });

    const result = await findDomainByNameApi('example.com', deps as any);

    expect(deps.http).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.azion.com/v4/domains?name=example.com',
    });
    expect(result).toEqual(domain);
  });

  it('retorna undefined quando API não possui domínio', async () => {
    deps.http.mockResolvedValue({ data: { results: [] } });

    const result = await findDomainByNameApi('missing.com', deps as any);

    expect(result).toBeUndefined();
  });
});
