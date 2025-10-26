import { jest } from '@jest/globals';
import { DomainRecord } from '../../../../src/models/entities/domainRecord.js';

const readStateFileMock = jest.fn();
const writeStateFileMock = jest.fn();

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  readStateFile: readStateFileMock,
  writeStateFile: writeStateFileMock,
}));

let persistDomain: typeof import('../../../../src/services/domain/persistDomain.js')['persistDomain'];

beforeAll(async () => {
  ({ persistDomain } = await import('../../../../src/services/domain/persistDomain.js'));
});

beforeEach(() => {
  readStateFileMock.mockReset();
  writeStateFileMock.mockReset();
});

describe('persistDomain', () => {
  it('adiciona domínio ao estado e retorna registro', async () => {
    readStateFileMock.mockResolvedValue({ domains: {} });
    writeStateFileMock.mockResolvedValue(undefined);

    const record = DomainRecord.hydrate({
      id: 'dom-1',
      name: 'example.com',
      edgeApplicationId: 'edge-1',
      cname: 'example.com.azioncdn.net',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      raw: {},
    });

    const result = await persistDomain(record);

    expect(writeStateFileMock).toHaveBeenCalledWith('edge/domains.json', {
      domains: { 'example.com': record.toJSON() },
    });
    expect(result).toBe(record);
  });
});
