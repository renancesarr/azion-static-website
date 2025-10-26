import { normalizeDomainState } from '../../../../src/services/domain/normalizeDomainState.js';

describe('normalizeDomainState', () => {
  it('cria estrutura vazia quando estado não existe', () => {
    expect(normalizeDomainState()).toEqual({ domains: {} });
  });

  it('garante presença de objeto domains', () => {
    const normalized = normalizeDomainState({
      domains: {
        'example.com': {
          id: 'dom-1',
          name: 'example.com',
          edgeApplicationId: 'edge-1',
          isActive: true,
          cname: 'example.com.azioncdn.net',
          createdAt: '2024-01-01T00:00:00Z',
          raw: {},
        },
      },
    });
    expect(normalized.domains['example.com']).toEqual({
      id: 'dom-1',
      name: 'example.com',
      edgeApplicationId: 'edge-1',
      isActive: true,
      cname: 'example.com.azioncdn.net',
      createdAt: '2024-01-01T00:00:00Z',
      raw: {},
    });
  });
});
