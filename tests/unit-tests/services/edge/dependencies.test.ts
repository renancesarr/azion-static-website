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

let defaultEdgeDependencies: typeof import('../../../../src/services/edge/dependencies.js')['defaultEdgeDependencies'];

beforeAll(async () => {
  ({ defaultEdgeDependencies } = await import('../../../../src/services/edge/dependencies.js'));
});

describe('edge dependencies', () => {
  it('retorna dependências padrão', () => {
    expect(azionApiBaseMock).toHaveBeenCalled();
    expect(defaultEdgeDependencies.apiBase).toBe('https://mock.azion');
    expect(defaultEdgeDependencies.http).toBe(fetchHttpClientMock);
    expect(defaultEdgeDependencies.state).toBe(fileStateRepositoryMock);
    expect(defaultEdgeDependencies.logger).toBeInstanceOf(Object);
  });
});
