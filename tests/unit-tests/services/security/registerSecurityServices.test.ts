import { jest } from '@jest/globals';

const ensureFirewallMock = jest.fn();
const ensureWafRulesetMock = jest.fn();
const ensureFirewallRuleMock = jest.fn();
const ensureWafMock = jest.fn();
const buildFirewallToolResponseMock = jest.fn();
const buildWafRulesetToolResponseMock = jest.fn();
const buildFirewallRuleToolResponseMock = jest.fn();
const buildWafToolResponseMock = jest.fn();
const findWafMock = jest.fn();
const fetchWafByEdgeAppApiMock = jest.fn();
const persistWafMock = jest.fn();
const buildWafRecordMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/security/ensureFirewall.js', () => ({
  ensureFirewall: ensureFirewallMock,
}));

jest.unstable_mockModule('../../../../src/services/security/ensureWafRuleset.js', () => ({
  ensureWafRuleset: ensureWafRulesetMock,
}));

jest.unstable_mockModule('../../../../src/services/security/ensureFirewallRule.js', () => ({
  ensureFirewallRule: ensureFirewallRuleMock,
}));

jest.unstable_mockModule('../../../../src/services/security/ensureWaf.js', () => ({
  ensureWaf: ensureWafMock,
}));

jest.unstable_mockModule('../../../../src/services/security/buildFirewallToolResponse.js', () => ({
  buildFirewallToolResponse: buildFirewallToolResponseMock,
}));

jest.unstable_mockModule('../../../../src/services/security/buildWafRulesetToolResponse.js', () => ({
  buildWafRulesetToolResponse: buildWafRulesetToolResponseMock,
}));

jest.unstable_mockModule('../../../../src/services/security/buildFirewallRuleToolResponse.js', () => ({
  buildFirewallRuleToolResponse: buildFirewallRuleToolResponseMock,
}));

jest.unstable_mockModule('../../../../src/services/security/buildWafToolResponse.js', () => ({
  buildWafToolResponse: buildWafToolResponseMock,
}));

jest.unstable_mockModule('../../../../src/services/security/findWaf.js', () => ({
  findWaf: findWafMock,
}));

jest.unstable_mockModule('../../../../src/services/security/fetchWafByEdgeAppApi.js', () => ({
  fetchWafByEdgeAppApi: fetchWafByEdgeAppApiMock,
}));

jest.unstable_mockModule('../../../../src/services/security/persistWaf.js', () => ({
  persistWaf: persistWafMock,
}));

jest.unstable_mockModule('../../../../src/services/security/buildWafRecord.js', () => ({
  buildWafRecord: buildWafRecordMock,
}));

let registerSecurityServices: typeof import('../../../../src/services/security/registerSecurityServices.js')['registerSecurityServices'];
let HttpError: typeof import('../../../../src/utils/http.js')['HttpError'];

beforeAll(async () => {
  ({ registerSecurityServices } = await import('../../../../src/services/security/registerSecurityServices.js'));
  ({ HttpError } = await import('../../../../src/utils/http.js'));
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

describe('registerSecurityServices', () => {
  const deps = { state: {} } as any;

  it('cria firewall via ensure e retorna resposta formatada', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    ensureFirewallMock.mockResolvedValue({ created: true, record: { id: 'fw-1', name: 'firewall', domainIds: [] } });
    buildFirewallToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'firewall' }] });

    registerSecurityServices(server as any, deps);

    const response = await handlers['azion.create_firewall']({ name: 'firewall', domainNames: ['example.com'] }, { sessionId: 'session-1' });

    expect(ensureFirewallMock).toHaveBeenCalledWith({ name: 'firewall', domainNames: ['example.com'] }, deps);
    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'Firewall firewall criado.' }),
      'session-1',
    );
    expect(response.content[0].text).toBe('firewall');
  });

  it('reaproveita ruleset existente', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    ensureWafRulesetMock.mockResolvedValue({ created: false, record: { id: 'ruleset-1', name: 'ruleset', mode: 'blocking' } });
    buildWafRulesetToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'ruleset' }] });

    registerSecurityServices(server as any, deps);

    const response = await handlers['azion.create_waf_ruleset']({ name: 'ruleset' }, { sessionId: 'session-2' });

    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'Ruleset ruleset reutilizado.' }),
      'session-2',
    );
    expect(response.content[0].text).toBe('ruleset');
  });

  it('aplica ruleset e registra log', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    ensureFirewallRuleMock.mockResolvedValue({ created: true, record: { id: 'binding-1', firewallId: 'fw-1', rulesetId: 'ruleset-1', order: 0 } });
    buildFirewallRuleToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'binding' }] });

    registerSecurityServices(server as any, deps);

    const response = await handlers['azion.apply_waf_ruleset']({ firewallId: 'fw-1', rulesetId: 'ruleset-1', order: 0 }, { sessionId: 'session-3' });

    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'Ruleset ruleset-1 aplicado ao firewall fw-1.' }),
      'session-3',
    );
    expect(response.content[0].text).toBe('binding');
  });

  it('configura WAF e utiliza estado local quando disponível', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    ensureWafMock.mockResolvedValue({ created: true, record: { wafId: 'waf-1', edgeApplicationId: 'edge-1', mode: 'blocking', enabled: true } });
    buildWafToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'waf response' }] });

    registerSecurityServices(server as any, deps);

    const response = await handlers['azion.configure_waf']({ edgeApplicationId: 'edge-1' }, { sessionId: 'session-4' });

    expect(ensureWafMock).toHaveBeenCalled();
    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'WAF atualizado para edgeApp=edge-1.' }),
      'session-4',
    );
    expect(response.content[0].text).toBe('waf response');
  });

  it('consulta status do WAF sincronizando com API quando cache inexistente', async () => {
    const { server, handlers } = setupServer();
    findWafMock.mockResolvedValueOnce(undefined);
    fetchWafByEdgeAppApiMock.mockResolvedValue({ id: 'waf-api', edge_application_id: 'edge-1' } as any);
    buildWafRecordMock.mockReturnValue({ wafId: 'waf-api', edgeApplicationId: 'edge-1', mode: 'blocking', enabled: true });
    persistWafMock.mockResolvedValue({ wafId: 'waf-api', edgeApplicationId: 'edge-1', mode: 'blocking', enabled: true });
    buildWafToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'waf api' }] });

    registerSecurityServices(server as any, deps);

    const response = await handlers['azion.waf_status']({ edgeApplicationId: 'edge-1' });

    expect(fetchWafByEdgeAppApiMock).toHaveBeenCalledWith('edge-1', deps);
    expect(response.content[0].text).toBe('waf api');
  });

  it('propaga erros http ao consultar status do WAF', async () => {
    const { server, handlers } = setupServer();
    findWafMock.mockResolvedValueOnce(undefined);
    fetchWafByEdgeAppApiMock.mockRejectedValue(new HttpError('boom', 500, 'Internal', null, { method: 'GET', url: 'x' }));

    registerSecurityServices(server as any, deps);

    await expect(handlers['azion.waf_status']({ edgeApplicationId: 'edge-1' })).rejects.toThrow('Falha ao consultar WAF: boom');
  });
});
