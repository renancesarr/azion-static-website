import { jest } from '@jest/globals';

const statePathMock = jest.fn((value: string) => `/state/${value}`);

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  statePath: statePathMock,
}));

let buildDomainToolResponse: typeof import('../../../../src/services/domain/buildDomainToolResponse.js')['buildDomainToolResponse'];

beforeAll(async () => {
  ({ buildDomainToolResponse } = await import('../../../../src/services/domain/buildDomainToolResponse.js'));
});

describe('buildDomainToolResponse', () => {
  it('monta resposta textual com informações do domain', () => {
    const response = buildDomainToolResponse('Domain criado.', {
      id: 'dom-1',
      name: 'example.com',
      edgeApplicationId: 'edge-1',
      cname: 'example.com.azioncdn.net',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      raw: {},
    });

    expect(response.content[0].text).toContain('Domain criado.');
    expect(response.content[0].text).toContain('- Domain: example.com');
    expect(response.content[0].text).toContain('- State: /state/edge/domains.json');
    expect(statePathMock).toHaveBeenCalledWith('edge/domains.json');
  });
});
