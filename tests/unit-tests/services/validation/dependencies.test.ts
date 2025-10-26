import { jest } from '@jest/globals';

const fetchHttpClientMock = {};
const fileStateRepositoryMock = {};
const ConsoleLoggerMock = jest.fn(function MockLogger() {});
const readDirMock = jest.fn();
const readFileMock = jest.fn();

jest.unstable_mockModule('../../../../src/utils/http.js', () => ({
  fetchHttpClient: fetchHttpClientMock,
}));

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  fileStateRepository: fileStateRepositoryMock,
}));

jest.unstable_mockModule('../../../../src/core/logging/ConsoleLogger.js', () => ({
  ConsoleLogger: ConsoleLoggerMock,
}));

let defaultValidationDependencies: typeof import('../../../../src/services/validation/dependencies.js')['defaultValidationDependencies'];

beforeAll(async () => {
  ({ defaultValidationDependencies } = await import('../../../../src/services/validation/dependencies.js'));
});

describe('validation dependencies', () => {
  it('define dependências padrão com utilitários de IO', () => {
    expect(defaultValidationDependencies.http).toBe(fetchHttpClientMock);
    expect(defaultValidationDependencies.state).toBe(fileStateRepositoryMock);
    expect(defaultValidationDependencies.logger).toBeInstanceOf(ConsoleLoggerMock);
    expect(typeof defaultValidationDependencies.setTimeout).toBe('function');
    expect(typeof defaultValidationDependencies.clearTimeout).toBe('function');
    expect(typeof defaultValidationDependencies.readDir).toBe('function');
    expect(typeof defaultValidationDependencies.readFile).toBe('function');
  });
});
