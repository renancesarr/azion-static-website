import { jest } from '@jest/globals';

const hashFileSHA256Mock = jest.fn();
const inferEncodingMock = jest.fn();
const buildUploadReportEntryMock = jest.fn();

jest.unstable_mockModule('../../../../src/utils/hash.js', () => ({
  hashFileSHA256: hashFileSHA256Mock,
}));

jest.unstable_mockModule('../../../../src/utils/mime.js', () => ({
  inferEncoding: inferEncodingMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/buildUploadReportEntry.js', () => ({
  buildUploadReportEntry: buildUploadReportEntryMock,
}));

let planUploadCandidates: typeof import('../../../../src/services/storage/planUploadCandidates.js')['planUploadCandidates'];

beforeAll(async () => {
  ({ planUploadCandidates } = await import('../../../../src/services/storage/planUploadCandidates.js'));
});

beforeEach(() => {
  hashFileSHA256Mock.mockReset();
  inferEncodingMock.mockReset();
  buildUploadReportEntryMock.mockReset();
});

describe('planUploadCandidates', () => {
  const entries = [
    {
      absolutePath: '/tmp/index.html',
      relativePath: 'index.html',
      size: 10,
    },
    {
      absolutePath: '/tmp/style.css.gz',
      relativePath: 'style.css.gz',
      size: 20,
    },
  ] as any[];

  it('classifica uploads entre candidatos e reaproveitados', async () => {
    hashFileSHA256Mock.mockResolvedValueOnce('hash-index').mockResolvedValueOnce('hash-style');
    inferEncodingMock.mockReturnValue({ contentType: 'text/plain', contentEncoding: undefined });
    buildUploadReportEntryMock.mockReturnValueOnce({ objectPath: 'index.html', status: 'skipped' });

    const index = {
      files: {
        'public/index.html': { hash: 'hash-index', size: 10, updatedAt: 'old' },
      },
    };

    const result = await planUploadCandidates(entries, index as any, {
      prefix: 'public',
      stripGzipExtension: true,
    } as any);

    expect(result.skipped).toHaveLength(1);
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      objectPath: 'public/style.css',
      contentEncoding: undefined,
    });
    expect(result.nextIndexFiles['index.html']).toMatchObject({
      hash: 'hash-index',
      sourcePath: 'index.html',
    });
    expect(buildUploadReportEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({ objectPath: 'index.html' }),
      'skipped',
      0,
    );
  });
});
