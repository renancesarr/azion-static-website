import { jest } from '@jest/globals';

const readFileMock = jest.fn();
const runWithPoolMock = jest.fn();

jest.unstable_mockModule('node:fs', () => ({
  promises: {
    readFile: readFileMock,
  },
}));

jest.unstable_mockModule('../../../../src/utils/concurrency.js', () => ({
  runWithPool: runWithPoolMock,
}));

let executeUploadBatch: typeof import('../../../../src/services/storage/executeUploadBatch.js')['executeUploadBatch'];

beforeAll(async () => {
  ({ executeUploadBatch } = await import('../../../../src/services/storage/executeUploadBatch.js'));
});

beforeEach(() => {
  readFileMock.mockReset();
  runWithPoolMock.mockReset();
});

describe('executeUploadBatch', () => {
  const bucket = { id: 'bucket-1', name: 'assets' } as any;
  const candidates = [
    {
      absolutePath: '/tmp/index.html',
      relativePath: 'index.html',
      objectPath: 'index.html',
      hash: 'hash-index',
      size: 10,
      contentType: 'text/html',
      contentEncoding: undefined,
    },
    {
      absolutePath: '/tmp/style.css',
      relativePath: 'style.css',
      objectPath: 'style.css',
      hash: 'hash-style',
      size: 20,
      contentType: 'text/css',
      contentEncoding: undefined,
    },
  ];

  it('executa uploads e agrega resultados de sucesso e falha', async () => {
    readFileMock.mockResolvedValue(Buffer.from('dummy'));

    runWithPoolMock.mockImplementation(async (tasks: Array<() => Promise<unknown>>) => {
      const responses = [];
      for (let i = 0; i < tasks.length; i += 1) {
        try {
          const value = await tasks[i]();
          responses.push({ value, attempts: 1 });
        } catch (error) {
          responses.push({ error: error as Error, attempts: 1 });
        }
      }
      return responses;
    });

    const deps = {
      apiBase: 'https://api.azion.com',
      http: {
        request: jest
          .fn()
          .mockResolvedValueOnce({})
          .mockRejectedValueOnce(new Error('boom')),
      },
      logger: {
        error: jest.fn(),
      },
    } as any;

    const nextIndexFiles: Record<string, any> = {};

    const result = await executeUploadBatch(candidates as any, bucket, nextIndexFiles, 2, deps);

    expect(deps.http.request).toHaveBeenCalledTimes(2);
    expect(result.uploaded).toHaveLength(1);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]).toMatchObject({ status: 'failed', error: 'Error: boom' });
    expect(nextIndexFiles['index.html']).toBeDefined();
    expect(nextIndexFiles['style.css']).toBeUndefined();
    expect(deps.logger.error).toHaveBeenCalledWith(expect.stringContaining('Falha ao enviar style.css'));
  });
});
