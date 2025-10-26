import { jest } from '@jest/globals';

const readStateFileMock = jest.fn();

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  readStateFile: readStateFileMock,
}));

let findDomainByName: typeof import('../../../../src/services/domain/findDomainByName.js')['findDomainByName'];

beforeAll(async () => {
  ({ findDomainByName } = await import('../../../../src/services/domain/findDomainByName.js'));
});

beforeEach(() => {
  readStateFileMock.mockReset();
});

describe('findDomainByName', () => {
  it('retorna domínio armazenado em state', async () => {
    readStateFileMock.mockResolvedValue({
      domains: {
        'example.com': { id: 'dom-1', name: 'example.com' },
      },
    });

    const result = await findDomainByName('example.com');

    expect(result).toEqual({ id: 'dom-1', name: 'example.com' });
    expect(readStateFileMock).toHaveBeenCalled();
  });

  it('retorna undefined quando domínio não existe', async () => {
    readStateFileMock.mockResolvedValue(undefined);

    const result = await findDomainByName('missing.com');

    expect(result).toBeUndefined();
  });
});
