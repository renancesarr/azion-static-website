import { jest } from '@jest/globals';

const azionApiBaseMock = jest.fn(() => 'https://mock.azion');
const httpMock = jest.fn();

jest.unstable_mockModule('../../../../src/utils/env.js', () => ({
  azionApiBase: azionApiBaseMock,
  uploadConcurrency: jest.fn(),
}));

jest.unstable_mockModule('../../../../src/utils/http.js', () => ({
  http: httpMock,
}));

let defaultDomainDependencies: typeof import('../../../../src/services/domain/dependencies.js')['defaultDomainDependencies'];

beforeAll(async () => {
  ({ defaultDomainDependencies } = await import('../../../../src/services/domain/dependencies.js'));
});

describe('domain dependencies', () => {
  it('resolve base URL via azionApiBase e injeta http utilitário', () => {
    expect(defaultDomainDependencies.apiBase).toBe('https://mock.azion');
    expect(defaultDomainDependencies.http).toBe(httpMock);
  });
});
