import { jest } from '@jest/globals';
import { StorageBucketRecord } from '../../../../src/models/entities/storageBucketRecord.js';

const resolveBucketReferenceMock = jest.fn();
const hashBufferSHA256Mock = jest.fn();
const loadUploadIndexMock = jest.fn();
const saveUploadIndexMock = jest.fn();
const buildObjectUrlMock = jest.fn();
const inferEncodingMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/storage/resolveBucketReference.js', () => ({
  resolveBucketReference: resolveBucketReferenceMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/hashBuffer.js', () => ({
  hashBufferSHA256: hashBufferSHA256Mock,
}));

jest.unstable_mockModule('../../../../src/services/storage/uploadIndex.js', () => ({
  loadUploadIndex: loadUploadIndexMock,
  saveUploadIndex: saveUploadIndexMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/buildObjectUrl.js', () => ({
  buildObjectUrl: buildObjectUrlMock,
}));

jest.unstable_mockModule('../../../../src/utils/mime.js', () => ({
  inferEncoding: inferEncodingMock,
  lookupMimeType: jest.fn(),
}));

let handlePutObject: typeof import('../../../../src/services/storage/handlePutObject.js')['handlePutObject'];

beforeAll(async () => {
  ({ handlePutObject } = await import('../../../../src/services/storage/handlePutObject.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('handlePutObject', () => {
  const server = {
    sendLoggingMessage: jest.fn(),
  } as any;
  const ctx = { sessionId: 'session-1' };
  const deps = {
    apiBase: 'https://api.azion.com',
    http: {
      request: jest.fn(),
    },
    state: {},
  } as any;

  it('envia objeto calculando hash automaticamente', async () => {
    resolveBucketReferenceMock.mockResolvedValue(
      StorageBucketRecord.create({ id: 'bucket-1', name: 'assets', createdAt: 'now', raw: {} }),
    );
    hashBufferSHA256Mock.mockReturnValue('mock-hash');
    inferEncodingMock.mockReturnValue({ contentType: 'text/html; charset=utf-8', contentEncoding: undefined });
    loadUploadIndexMock.mockResolvedValue({ files: {} });
    saveUploadIndexMock.mockResolvedValue(undefined);
    buildObjectUrlMock.mockReturnValue('https://upload');

    const result = await handlePutObject(
      server,
      {
        bucketId: 'bucket-1',
        objectPath: 'index.html',
        contentBase64: Buffer.from('hello').toString('base64'),
      } as any,
      ctx,
      deps,
    );

    expect(resolveBucketReferenceMock).toHaveBeenCalledWith({ bucketId: 'bucket-1', bucketName: undefined }, deps);
    expect(hashBufferSHA256Mock).toHaveBeenCalled();
    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'https://upload',
      body: expect.any(Buffer),
      headers: expect.objectContaining({
        'Content-Type': 'text/html; charset=utf-8',
        'X-Checksum-Sha256': 'mock-hash',
      }),
    });
    expect(saveUploadIndexMock).toHaveBeenCalled();
    expect(server.sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'info' }),
      'session-1',
    );
    expect(result.content[0].text).toContain('Objeto publicado com sucesso.');
    expect(result.content[0].text).toContain('- Index:');
  });
});
