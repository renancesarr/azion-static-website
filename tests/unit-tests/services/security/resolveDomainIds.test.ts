import { jest } from '@jest/globals';

const readStateFileMock = jest.fn();

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  readStateFile: readStateFileMock,
}));

let resolveDomainIds: typeof import('../../../../src/services/security/resolveDomainIds.js')['resolveDomainIds'];

beforeAll(async () => {
  ({ resolveDomainIds } = await import('../../../../src/services/security/resolveDomainIds.js'));
});

beforeEach(() => {
  readStateFileMock.mockReset();
});

describe('resolveDomainIds', () => {
  it('retorna ids existentes e resolve nomes', async () => {
    readStateFileMock.mockResolvedValue({ domains: { 'example.com': { id: 'dom-1' } } });

    const ids = await resolveDomainIds({ domainIds: ['dom-2'], domainNames: ['example.com'] } as any);

    expect(ids.sort()).toEqual(['dom-1', 'dom-2'].sort());
  });

  it('falha quando domínio nomeado não existe', async () => {
    readStateFileMock.mockResolvedValue({ domains: {} });

    await expect(resolveDomainIds({ domainNames: ['missing.com'] } as any)).rejects.toThrow(
      'Domain missing.com não encontrado em cache local. Execute azion.create_domain antes.',
    );
  });

  it('falha quando nenhum domínio válido encontrado', async () => {
    readStateFileMock.mockResolvedValue({ domains: {} });

    await expect(resolveDomainIds({} as any)).rejects.toThrow('Nenhum domínio válido encontrado para o firewall.');
  });
});
