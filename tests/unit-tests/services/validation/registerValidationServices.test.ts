import { jest } from '@jest/globals';

const runStackValidationMock = jest.fn();
const validateMimetypesMock = jest.fn();
const validateUploadIdempotencyMock = jest.fn();
const inspectUploadLogsMock = jest.fn();
const checkBucketConflictMock = jest.fn();
const checkDomainConflictMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/validation/runStackValidation.js', () => ({
  runStackValidation: runStackValidationMock,
}));

jest.unstable_mockModule('../../../../src/services/validation/validateMimetypes.js', () => ({
  validateMimetypes: validateMimetypesMock,
}));

jest.unstable_mockModule('../../../../src/services/validation/validateUploadIdempotency.js', () => ({
  validateUploadIdempotency: validateUploadIdempotencyMock,
}));

jest.unstable_mockModule('../../../../src/services/validation/inspectUploadLogs.js', () => ({
  inspectUploadLogs: inspectUploadLogsMock,
}));

jest.unstable_mockModule('../../../../src/services/validation/checkBucketConflict.js', () => ({
  checkBucketConflict: checkBucketConflictMock,
}));

jest.unstable_mockModule('../../../../src/services/validation/checkDomainConflict.js', () => ({
  checkDomainConflict: checkDomainConflictMock,
}));

let registerValidationServices: typeof import('../../../../src/services/validation/registerValidationServices.js')['registerValidationServices'];

beforeAll(async () => {
  ({ registerValidationServices } = await import('../../../../src/services/validation/registerValidationServices.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

function setupServer() {
  const handlers: Record<string, (args: unknown, extra?: any) => Promise<any>> = {};
  const registerTool = jest.fn((name, _config, handler) => {
    handlers[name] = handler;
  });
  const server = { registerTool };
  return { server, handlers };
}

describe('registerValidationServices', () => {
  it('registra ferramentas e gera respostas formatadas', async () => {
    const { server, handlers } = setupServer();
    runStackValidationMock.mockResolvedValue({
      project: 'site',
      domain: 'example.com',
      checks: [{ name: 'Bucket', ok: true, detail: 'ok' }],
      http: { ok: true, status: 200, durationMs: 100, url: 'https://example.com/', error: undefined },
    });
    validateMimetypesMock.mockResolvedValue({ matches: 2, mismatches: [] });
    validateUploadIdempotencyMock.mockResolvedValue([{ name: 'Objetos únicos', ok: true, detail: 'ok' }]);
    inspectUploadLogsMock.mockResolvedValue([{ name: 'upload-1.json', ok: true, detail: 'enviados=1' }]);
    checkBucketConflictMock.mockResolvedValue({ name: 'Bucket existente', ok: true, detail: 'bucket ok' });
    checkDomainConflictMock.mockResolvedValue({ name: 'Domain existente', ok: false, detail: 'domínio ausente' });

    registerValidationServices(server as any);

    const stackResponse = await handlers['azion.validate_stack']({ domain: 'example.com' }, {});
    expect(stackResponse.content[0].text).toContain('Checks: 1/1 OK');

    const mimeResponse = await handlers['azion.validate_mimetypes']({ extensions: ['.html'] });
    expect(mimeResponse.content[0].text).toContain('Objetos válidos: 2');

    const idempotencyResponse = await handlers['azion.validate_upload_idempotency']({}, {});
    expect(idempotencyResponse.content[0].text).toContain('Verificação de idempotência');

    const logsResponse = await handlers['azion.inspect_upload_logs']({ limit: 1 }, {});
    expect(logsResponse.content[0].text).toContain('upload-1.json');

    const bucketResponse = await handlers['azion.verify_bucket_conflict']({ bucketName: 'bucket' });
    expect(bucketResponse.content[0].text).toContain('Bucket existente');

    const domainResponse = await handlers['azion.verify_domain_conflict']({ domainName: 'example.com' });
    expect(domainResponse.content[0].text).toContain('Domain existente');
  });
});
