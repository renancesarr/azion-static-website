import { jest } from '@jest/globals';
import { UploadIndexFile } from '../../../../src/models/entities/uploadIndexFile.js';

const loadFirstUploadIndexMock = jest.fn();
const lookupMimeTypeMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/validation/loadFirstUploadIndex.js', () => ({
  loadFirstUploadIndex: loadFirstUploadIndexMock,
}));

jest.unstable_mockModule('../../../../src/utils/mime.js', () => ({
  lookupMimeType: lookupMimeTypeMock,
}));

let validateMimetypes: typeof import('../../../../src/services/validation/validateMimetypes.js')['validateMimetypes'];

beforeAll(async () => {
  ({ validateMimetypes } = await import('../../../../src/services/validation/validateMimetypes.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('validateMimetypes', () => {
  const deps = { state: {} } as any;

  it('retorna erro quando índice não existe', async () => {
    loadFirstUploadIndexMock.mockResolvedValue(undefined);

    const result = await validateMimetypes(['.html'], deps);

    expect(result.matches).toBe(0);
    expect(result.mismatches[0].detail).toContain('Nenhum índice');
  });

  it('detecta mismatches e acertos', async () => {
    const uploadIndex = UploadIndexFile.create({
      bucketId: 'bucket-1',
      bucketName: 'assets',
      files: {
        'index.html': { objectPath: 'index.html', contentType: 'text/html; charset=utf-8' } as any,
        'style.css': { objectPath: 'style.css', contentType: 'text/plain' } as any,
        'image.png': { objectPath: 'image.png' } as any,
      },
      updatedAt: new Date().toISOString(),
    });
    loadFirstUploadIndexMock.mockResolvedValue({
      bucketId: 'bucket-1',
      file: uploadIndex,
      path: 'storage/uploads/index-bucket-1.json',
    });
    lookupMimeTypeMock.mockReturnValueOnce('text/html; charset=utf-8').mockReturnValueOnce('text/css; charset=utf-8').mockReturnValueOnce('image/png');

    const result = await validateMimetypes(['.html', '.css', '.png'], deps);

    expect(result.matches).toBe(1);
    expect(result.mismatches).toHaveLength(2);
    expect(result.mismatches[0].name).toBe('style.css');
    expect(result.mismatches[1].name).toBe('image.png');
  });
});
