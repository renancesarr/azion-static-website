import { jest } from '@jest/globals';

const buildDomainToolResponseMock = jest.fn();
const findDomainByNameMock = jest.fn();
const createDomainViaApiMock = jest.fn();
const persistDomainMock = jest.fn();
const buildDomainRecordMock = jest.fn();
const findDomainByNameApiMock = jest.fn();
const buildDnsInstructionMock = jest.fn();
const statePathMock = jest.fn((value: string) => `/state/${value}`);

jest.unstable_mockModule('../../../../src/services/domain/buildDomainToolResponse.js', () => ({
  buildDomainToolResponse: buildDomainToolResponseMock,
}));

jest.unstable_mockModule('../../../../src/services/domain/findDomainByName.js', () => ({
  findDomainByName: findDomainByNameMock,
}));

jest.unstable_mockModule('../../../../src/services/domain/createDomainViaApi.js', () => ({
  createDomainViaApi: createDomainViaApiMock,
}));

jest.unstable_mockModule('../../../../src/services/domain/persistDomain.js', () => ({
  persistDomain: persistDomainMock,
}));

jest.unstable_mockModule('../../../../src/services/domain/buildDomainRecord.js', () => ({
  buildDomainRecord: buildDomainRecordMock,
}));

jest.unstable_mockModule('../../../../src/services/domain/findDomainByNameApi.js', () => ({
  findDomainByNameApi: findDomainByNameApiMock,
}));

jest.unstable_mockModule('../../../../src/services/domain/buildDnsInstruction.js', () => ({
  buildDnsInstruction: buildDnsInstructionMock,
}));

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  statePath: statePathMock,
}));

type RegisterModule = typeof import('../../../../src/services/domain/registerDomainServices.js');

let registerDomainServices: RegisterModule['registerDomainServices'];

beforeAll(async () => {
  ({ registerDomainServices } = await import('../../../../src/services/domain/registerDomainServices.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

function setupServer() {
  const handlers: Record<string, (args: unknown, extra?: any) => Promise<unknown>> = {};
  const registerTool = jest.fn((name, _config, handler) => {
    handlers[name] = handler;
  });
  const sendLoggingMessage = jest.fn();
  const server = { registerTool, sendLoggingMessage };
  return { server, handlers, registerTool, sendLoggingMessage };
}

describe('registerDomainServices', () => {
  it('registra tools e reutiliza domínio cacheado', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    buildDomainToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'cached' }] });
    findDomainByNameMock.mockResolvedValue({ id: 'dom-1', name: 'example.com' });

    registerDomainServices(server as any);

    expect(server.registerTool).toHaveBeenCalledWith(
      'azion.create_domain',
      expect.objectContaining({ title: 'Criar Domain Azion' }),
      expect.any(Function),
    );

    const response = await handlers['azion.create_domain']({ name: 'example.com', edge_application_id: 'edge-1' }, { sessionId: '123' });

    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'Domain example.com reaproveitado do cache.' }),
      '123',
    );
    expect(response).toEqual({ content: [{ type: 'text', text: 'cached' }] });
  });

  it('cria domínio via API quando ausente em cache', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    findDomainByNameMock.mockResolvedValueOnce(undefined);
    createDomainViaApiMock.mockResolvedValue({ id: 'dom-2', name: 'example.com' });
    buildDomainToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'created' }] });

    registerDomainServices(server as any, { apiBase: 'https://api.azion.com', http: jest.fn() });

    const response = await handlers['azion.create_domain'](
      { name: 'example.com', edge_application_id: 'edge-1' },
      { sessionId: 'abc' },
    );

    expect(createDomainViaApiMock).toHaveBeenCalled();
    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'Domain example.com criado na Azion.' }),
      'abc',
    );
    expect(response).toEqual({ content: [{ type: 'text', text: 'created' }] });
  });

  it('gera instruções DNS sincronizando estado quando domínio não estiver em cache', async () => {
    const { server, handlers } = setupServer();
    findDomainByNameMock.mockResolvedValue(undefined);
    const apiDomain = {
      id: 'dom-3',
      name: 'example.com',
      cname: 'example.com.azioncdn.net',
      edge_application_id: 'edge-1',
      cnames: [],
      active: true,
      created_at: '2024-01-01T00:00:00Z',
    };
    findDomainByNameApiMock.mockResolvedValue(apiDomain);
    buildDomainRecordMock.mockReturnValue({ id: 'dom-3', name: 'example.com' });
    persistDomainMock.mockResolvedValue({ id: 'dom-3' });
    buildDnsInstructionMock.mockReturnValue(['line-1', 'line-2']);

    registerDomainServices(server as any);

    const response = (await handlers['azion.dns_instructions']({ domainName: 'example.com' })) as any;

    expect(findDomainByNameApiMock).toHaveBeenCalledWith('example.com', expect.any(Object));
    expect(persistDomainMock).toHaveBeenCalledWith({ id: 'dom-3', name: 'example.com' });
    expect(response.content[0].text).toBe('line-1\nline-2');
    expect(response.content[1].text).toContain('/state/edge/domains.json');
    expect(statePathMock).toHaveBeenCalledWith('edge/domains.json');
  });

  it('gera instruções usando domínio cacheado quando API não retorna dados', async () => {
    const { server, handlers } = setupServer();
    const cached = {
      id: 'dom-4',
      name: 'example.com',
      cname: 'example.com.azioncdn.net',
      edgeApplicationId: 'edge-1',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      raw: {},
    };
    findDomainByNameMock.mockResolvedValue(cached);
    findDomainByNameApiMock.mockResolvedValue(undefined);
    buildDnsInstructionMock.mockReturnValue(['cached-line']);

    registerDomainServices(server as any);

    const response = (await handlers['azion.dns_instructions']({ domainName: 'example.com' })) as any;

    expect(response.content[0].text).toContain('cached-line');
    expect(persistDomainMock).not.toHaveBeenCalled();
  });
});
