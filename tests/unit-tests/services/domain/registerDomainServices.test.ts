import { jest } from '@jest/globals';
const buildDomainToolResponseMock = jest.fn();
const ensureDomainMock = jest.fn();
const getDnsInstructionsMock = jest.fn();
const createDomainServiceMock = jest.fn(() => ({
  ensureDomain: ensureDomainMock,
  getDnsInstructions: getDnsInstructionsMock,
}));
const statePathMock = jest.fn((value: string) => `/state/${value}`);

jest.unstable_mockModule('../../../../src/services/domain/buildDomainToolResponse.js', () => ({
  buildDomainToolResponse: buildDomainToolResponseMock,
}));

jest.unstable_mockModule('../../../../src/services/domain/domainService.js', () => ({
  createDomainService: createDomainServiceMock,
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
  ensureDomainMock.mockReset();
  getDnsInstructionsMock.mockReset();
  createDomainServiceMock.mockReturnValue({ ensureDomain: ensureDomainMock, getDnsInstructions: getDnsInstructionsMock });
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
    ensureDomainMock.mockResolvedValue({ record: { id: 'dom-1', name: 'example.com' }, created: false });

    registerDomainServices(server as any);

    expect(server.registerTool).toHaveBeenCalledWith(
      'azion.create_domain',
      expect.objectContaining({ title: 'Criar Domain Azion' }),
      expect.any(Function),
    );

    const response = await handlers['azion.create_domain'](
      { name: 'example.com', edgeApplicationId: 'edge-1' },
      { sessionId: '123' },
    );

    expect(ensureDomainMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'example.com', edgeApplicationId: 'edge-1' }),
    );
    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'Domain example.com reaproveitado do cache.' }),
      '123',
    );
    expect(response).toEqual({ content: [{ type: 'text', text: 'cached' }] });
  });

  it('cria domínio via API quando ausente em cache', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    ensureDomainMock.mockResolvedValue({ record: { id: 'dom-2', name: 'example.com' }, created: true });
    buildDomainToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'created' }] });

    registerDomainServices(server as any, { apiBase: 'https://api.azion.com', http: jest.fn() });

    const response = await handlers['azion.create_domain']({ name: 'example.com', edgeApplicationId: 'edge-1' }, { sessionId: 'abc' });

    expect(ensureDomainMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'example.com', edgeApplicationId: 'edge-1' }),
    );
    expect(sendLoggingMessage).toHaveBeenCalledWith(expect.objectContaining({ data: 'Domain example.com criado na Azion.' }), 'abc');
    expect(response).toEqual({ content: [{ type: 'text', text: 'created' }] });
  });

  it('gera instruções DNS sincronizando estado quando domínio não estiver em cache', async () => {
    const { server, handlers } = setupServer();
    getDnsInstructionsMock.mockResolvedValue({
      record: { id: 'dom-3', name: 'example.com' },
      instructions: ['line-1', 'line-2'],
      source: 'api',
      stateSynced: true,
    });

    registerDomainServices(server as any);

    const response = (await handlers['azion.dns_instructions']({ domainName: 'example.com' })) as any;

    expect(getDnsInstructionsMock).toHaveBeenCalledWith('example.com');
    expect(response.content[0].text).toBe('line-1\nline-2');
    expect(response.content[1].text).toContain('/state/edge/domains.json');
    expect(statePathMock).toHaveBeenCalledWith('edge/domains.json');
  });

  it('gera instruções usando domínio cacheado quando API não retorna dados', async () => {
    const { server, handlers } = setupServer();
    getDnsInstructionsMock.mockResolvedValue({
      record: { id: 'dom-4', name: 'example.com' },
      instructions: ['cached-line'],
      source: 'cache',
      stateSynced: false,
    });

    registerDomainServices(server as any);

    const response = (await handlers['azion.dns_instructions']({ domainName: 'example.com' })) as any;

    expect(response.content[0].text).toContain('cached-line');
    expect(response.content).toHaveLength(1);
  });
});
