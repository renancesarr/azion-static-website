import { jest } from '@jest/globals';

const loadFirstUploadIndexMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/validation/loadFirstUploadIndex.js', () => ({
  loadFirstUploadIndex: loadFirstUploadIndexMock,
}));

let validateUploadIdempotency: typeof import('../../../../src/services/validation/validateUploadIdempotency.js')['validateUploadIdempotency'];

beforeAll(async () => {
  ({ validateUploadIdempotency } = await import('../../../../src/services/validation/validateUploadIdempotency.js'));
});

beforeEach(() => {
  loadFirstUploadIndexMock.mockReset();
});

describe('validateUploadIdempotency', () => {
  const deps = { state: {} } as any;

  it('retorna alerta quando índice ausente', async () => {
    loadFirstUploadIndexMock.mockResolvedValue(undefined);

    const result = await validateUploadIdempotency(deps);
    expect(result[0].ok).toBe(false);
  });

  it('detecta duplicados e falta de hash', async () => {
    loadFirstUploadIndexMock.mockResolvedValue({
      file: {
        files: {
          'index.html': { objectPath: 'index.html', hash: 'hash-1' },
          'duplicate.js': { objectPath: 'duplicate.js', hash: 'hash-2' },
          'duplicate.js#2': { objectPath: 'duplicate.js', hash: 'hash-3' },
          'no-hash.txt': { objectPath: 'no-hash.txt' },
        },
      },
    });

    const result = await validateUploadIdempotency(deps);
    expect(result[0].detail).toContain('duplicate.js');
    expect(result[0].ok).toBe(false);
    expect(result[1].detail).toContain('no-hash.txt');
    expect(result[1].ok).toBe(false);
  });
});
