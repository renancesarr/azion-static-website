import { jest } from '@jest/globals';

const lookupBucketByNameMock = jest.fn();
const createBucketViaApiMock = jest.fn();
const buildBucketToolResponseMock = jest.fn();
const handlePutObjectMock = jest.fn();
const processUploadDirMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/storage/lookupBucket.js', () => ({
  lookupBucketByName: lookupBucketByNameMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/createBucketViaApi.js', () => ({
  createBucketViaApi: createBucketViaApiMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/buildBucketToolResponse.js', () => ({
  buildBucketToolResponse: buildBucketToolResponseMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/handlePutObject.js', () => ({
  handlePutObject: handlePutObjectMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/processUploadDir.js', () => ({
  processUploadDir: processUploadDirMock,
}));

let registerStorageServices: typeof import('../../../../src/services/storage/registerStorageServices.js')['registerStorageServices'];

beforeAll(async () => {
  ({ registerStorageServices } = await import('../../../../src/services/storage/registerStorageServices.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

function setupServer() {
  const handlers: Record<string, (args: unknown, extra?: any) => Promise<any>> = {};
  const registerTool = jest.fn((name, _config, handler) => {
    handlers[name] = handler;
  });
  const sendLoggingMessage = jest.fn();
  const server = { registerTool, sendLoggingMessage };
  return { server, handlers, sendLoggingMessage };
}

describe('registerStorageServices', () => {
  it('reutiliza bucket do cache', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    lookupBucketByNameMock.mockResolvedValue({ id: 'bucket-1', name: 'assets' });
    buildBucketToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'cached' }] });

    registerStorageServices(server as any, { state: {}, logger: {}, http: {}, uploadConcurrency: () => 4 } as any);

    const response = await handlers['azion.create_bucket']({ name: 'assets' }, { sessionId: 'session-1' });

    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'Bucket assets já registrado em cache local. Pulando criação.' }),
      'session-1',
    );
    expect(response.content[0].text).toBe('cached');
    expect(createBucketViaApiMock).not.toHaveBeenCalled();
  });

  it('cria bucket quando inexistente', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    lookupBucketByNameMock.mockResolvedValueOnce(undefined);
    createBucketViaApiMock.mockResolvedValue({ id: 'bucket-2', name: 'assets' });
    buildBucketToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'created' }] });

    registerStorageServices(server as any, { state: {}, logger: {}, http: {}, uploadConcurrency: () => 4 } as any);

    const response = await handlers['azion.create_bucket']({ name: 'assets' }, { sessionId: 'session-2' });

    expect(createBucketViaApiMock).toHaveBeenCalled();
    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'Bucket assets criado ou recuperado via API.' }),
      'session-2',
    );
    expect(response.content[0].text).toBe('created');
  });

  it('delegates put_object para handlePutObject', async () => {
    const { server, handlers } = setupServer();
    handlePutObjectMock.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });

    registerStorageServices(server as any, { state: {}, logger: {}, http: {}, uploadConcurrency: () => 4 } as any);

    const response = await handlers['azion.put_object']({ bucketName: 'assets', objectPath: 'index.html', contentBase64: 'a' }, {});

    expect(handlePutObjectMock).toHaveBeenCalled();
    expect(response.content[0].text).toBe('ok');
  });

  it('formata resposta do upload_dir usando summaryLines', async () => {
    const { server, handlers } = setupServer();
    processUploadDirMock.mockResolvedValue({ summaryLines: ['linha-1', 'linha-2'] });

    registerStorageServices(server as any, { state: {}, logger: {}, http: {}, uploadConcurrency: () => 4 } as any);

    const response = await handlers['azion.upload_dir']({ bucketName: 'assets', localDir: './dist' }, {});

    expect(response.content[0].text).toBe('linha-1\nlinha-2');
  });
});
