import { normalizeDomainState } from '../../../../src/services/domain/normalizeDomainState.js';

describe('normalizeDomainState', () => {
  it('cria estrutura vazia quando estado não existe', () => {
    expect(normalizeDomainState()).toEqual({ domains: {} });
  });

  it('garante presença de objeto domains', () => {
    const normalized = normalizeDomainState({ domains: { 'example.com': { id: 'dom-1' } } });
    expect(normalized.domains['example.com']).toEqual({ id: 'dom-1' });
  });
});
