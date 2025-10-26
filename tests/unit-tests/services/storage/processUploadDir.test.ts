import { jest } from '@jest/globals';

const statMock = jest.fn();
const walkDirectoryMock = jest.fn();
const resolveBucketReferenceMock = jest.fn();
const loadUploadIndexMock = jest.fn();
const saveUploadIndexMock = jest.fn();
const planUploadCandidatesMock = jest.fn();
const executeUploadBatchMock = jest.fn();
const buildUploadReportMock = jest.fn();
const statePathMock = jest.fn((value: string) => `/state/${value}`);
const uploadIndexRelativePathMock = jest.fn(() => 'storage/uploads/index-bucket-1.json');
const uploadLogRelativePathMock = jest.fn(() => 'storage/uploads/logs/upload-run.json');

jest.unstable_mockModule('node:fs', () => ({
  promises: {
    stat: statMock,
  },
}));

jest.unstable_mockModule('../../../../src/utils/fs.js', () => ({
  walkDirectory: walkDirectoryMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/resolveBucketReference.js', () => ({
  resolveBucketReference: resolveBucketReferenceMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/uploadIndex.js', () => ({
  loadUploadIndex: loadUploadIndexMock,
  saveUploadIndex: saveUploadIndexMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/planUploadCandidates.js', () => ({
  planUploadCandidates: planUploadCandidatesMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/executeUploadBatch.js', () => ({
  executeUploadBatch: executeUploadBatchMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/buildUploadReport.js', () => ({
  buildUploadReport: buildUploadReportMock,
}));

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  statePath: statePathMock,
  fileStateRepository: {},
}));

jest.unstable_mockModule('../../../../src/services/storage/paths.js', () => ({
  uploadIndexRelativePath: uploadIndexRelativePathMock,
  uploadLogRelativePath: uploadLogRelativePathMock,
  sanitizeFileSegment: jest.fn(),
}));

let processUploadDir: typeof import('../../../../src/services/storage/processUploadDir.js')['processUploadDir'];

beforeAll(async () => {
  ({ processUploadDir } = await import('../../../../src/services/storage/processUploadDir.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
  statMock.mockResolvedValue({ isDirectory: () => true });
  resolveBucketReferenceMock.mockResolvedValue({ id: 'bucket-1', name: 'assets' });
});

describe('processUploadDir', () => {
  const server = {
    sendLoggingMessage: jest.fn(),
  } as any;

  const ctx = { sessionId: 'session-1' };
  const deps = {
    logger: {
      info: jest.fn(),
      error: jest.fn(),
    },
    state: {
      write: jest.fn(),
    },
    uploadConcurrency: () => 4,
  } as any;

  it('retorna relatório vazio quando diretório não possui arquivos', async () => {
    walkDirectoryMock.mockResolvedValue([]);
    buildUploadReportMock.mockReturnValue({
      totals: { toUpload: 0, uploaded: 0, skipped: 0, failed: 0, scanned: 0 },
    });

    const execution = await processUploadDir(
      server,
      { bucketId: 'bucket-1', localDir: './dist', dryRun: false } as any,
      ctx,
      deps,
    );

    expect(execution.summaryLines[0]).toContain('não possui arquivos.');
    expect(server.sendLoggingMessage).not.toHaveBeenCalledWith(expect.objectContaining({ level: 'error' }), expect.anything());
  });

  it('gera dry-run com estatísticas e log persistido', async () => {
    walkDirectoryMock.mockResolvedValue([{ absolutePath: '/tmp/index.html', relativePath: 'index.html', size: 10 }] as any);
    loadUploadIndexMock.mockResolvedValue({ files: {} });
    planUploadCandidatesMock.mockResolvedValue({
      candidates: [{ objectPath: 'index.html' }],
      skipped: [],
      nextIndexFiles: { 'index.html': {} },
    });
    buildUploadReportMock.mockReturnValue({
      totals: { toUpload: 1, uploaded: 0, skipped: 0, failed: 0, scanned: 1 },
      dryRun: true,
    });

    const execution = await processUploadDir(
      server,
      { bucketId: 'bucket-1', localDir: './dist', dryRun: true } as any,
      ctx,
      deps,
    );

    expect(deps.state.write).toHaveBeenCalledWith('storage/uploads/logs/upload-run.json', expect.any(Object));
    expect(execution.summaryLines).toContain('- Necessários upload: 1');
  });

  it('executa upload real e atualiza índice', async () => {
    walkDirectoryMock.mockResolvedValue([{ absolutePath: '/tmp/index.html', relativePath: 'index.html', size: 10 }] as any);
    loadUploadIndexMock.mockResolvedValue({ files: {} });
    planUploadCandidatesMock.mockResolvedValue({
      candidates: [{ objectPath: 'index.html', hash: 'hash', size: 10 }],
      skipped: [],
      nextIndexFiles: {},
    });
    executeUploadBatchMock.mockResolvedValue({
      uploaded: [{ objectPath: 'index.html', status: 'uploaded', attempts: 1 }],
      failed: [],
    });
    buildUploadReportMock.mockReturnValue({
      totals: { toUpload: 1, uploaded: 1, skipped: 0, failed: 0, scanned: 1 },
      dryRun: false,
    });

    const execution = await processUploadDir(
      server,
      { bucketId: 'bucket-1', localDir: './dist', dryRun: false } as any,
      ctx,
      deps,
    );

    expect(executeUploadBatchMock).toHaveBeenCalled();
    expect(saveUploadIndexMock).toHaveBeenCalled();
    expect(execution.summaryLines).toContain('- Enviados: 1');
  });
});
