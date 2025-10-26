import { jest } from '@jest/globals';

const azionApiBaseMock = jest.fn(() => 'https://mock.azion');
const fetchHttpClientMock = {};
const fileStateRepositoryMock = {};
const consoleLoggerMock = {};

jest.unstable_mockModule('../../../../src/utils/env.js', () => ({
  azionApiBase: azionApiBaseMock,
}));

jest.unstable_mockModule('../../../../src/utils/http.js', () => ({
  fetchHttpClient: fetchHttpClientMock,
}));

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  fileStateRepository: fileStateRepositoryMock,
}));

jest.unstable_mockModule('../../../../src/core/logging/ConsoleLogger.js', () => ({
  ConsoleLogger: function MockLogger(this: any) {
    Object.assign(this, consoleLoggerMock);
  },
}));

let defaultSecurityDependencies: typeof import('../../../../src/services/security/dependencies.js')['defaultSecurityDependencies'];

beforeAll(async () => {
  ({ defaultSecurityDependencies } = await import('../../../../src/services/security/dependencies.js'));
});

describe('security dependencies', () => {
  it('resolve dependências padrão', () => {
    expect(defaultSecurityDependencies.apiBase).toBe('https://mock.azion');
    expect(defaultSecurityDependencies.http).toBe(fetchHttpClientMock);
    expect(defaultSecurityDependencies.state).toBe(fileStateRepositoryMock);
    expect(defaultSecurityDependencies.logger).toBeInstanceOf(Object);
  });
});
