import { jest } from '@jest/globals';

const azionApiBaseMock = jest.fn(() => 'https://mock.azion');
const uploadConcurrencyMock = jest.fn(() => 8);
const fetchHttpClientMock = {};
const fileStateRepositoryMock = {};
const consoleLoggerMock = {};

jest.unstable_mockModule('../../../../src/utils/env.js', () => ({
  azionApiBase: azionApiBaseMock,
  uploadConcurrency: uploadConcurrencyMock,
}));

jest.unstable_mockModule('../../../../src/utils/http.js', () => ({
  fetchHttpClient: fetchHttpClientMock,
}));

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  fileStateRepository: fileStateRepositoryMock,
  statePath: jest.fn((value: string) => value),
}));

jest.unstable_mockModule('../../../../src/core/logging/ConsoleLogger.js', () => ({
  ConsoleLogger: function MockLogger(this: any) {
    Object.assign(this, consoleLoggerMock);
  },
}));

let defaultStorageDependencies: typeof import('../../../../src/services/storage/dependencies.js')['defaultStorageDependencies'];

beforeAll(async () => {
  ({ defaultStorageDependencies } = await import('../../../../src/services/storage/dependencies.js'));
});

describe('storage dependencies', () => {
  it('constrói objeto com clients padrão', () => {
    expect(defaultStorageDependencies.apiBase).toBe('https://mock.azion');
    expect(defaultStorageDependencies.http).toBe(fetchHttpClientMock);
    expect(defaultStorageDependencies.state).toBe(fileStateRepositoryMock);
    expect(defaultStorageDependencies.uploadConcurrency).toBe(uploadConcurrencyMock);
  });
});
