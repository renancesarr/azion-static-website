import { jest } from '@jest/globals';

const ensureEdgeApplicationMock = jest.fn();
const ensureEdgeConnectorMock = jest.fn();
const ensureCacheRuleMock = jest.fn();
const buildEdgeApplicationToolResponseMock = jest.fn();
const buildEdgeConnectorToolResponseMock = jest.fn();
const buildEdgeRuleToolResponseMock = jest.fn();
const findConnectorByNameMock = jest.fn();
const resolveConnectorBucketMock = jest.fn();
const findRuleByOrderMock = jest.fn();
const findRuleByOrderApiMock = jest.fn();
const persistRuleMock = jest.fn();
const buildRuleRecordMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/edge/ensureEdgeApplication.js', () => ({
  ensureEdgeApplication: ensureEdgeApplicationMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/ensureEdgeConnector.js', () => ({
  ensureEdgeConnector: ensureEdgeConnectorMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/ensureCacheRule.js', () => ({
  ensureCacheRule: ensureCacheRuleMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/buildEdgeApplicationToolResponse.js', () => ({
  buildEdgeApplicationToolResponse: buildEdgeApplicationToolResponseMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/buildEdgeConnectorToolResponse.js', () => ({
  buildEdgeConnectorToolResponse: buildEdgeConnectorToolResponseMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/buildEdgeRuleToolResponse.js', () => ({
  buildEdgeRuleToolResponse: buildEdgeRuleToolResponseMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/findConnectorByName.js', () => ({
  findConnectorByName: findConnectorByNameMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/resolveConnectorBucket.js', () => ({
  resolveConnectorBucket: resolveConnectorBucketMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/findRuleByOrder.js', () => ({
  findRuleByOrder: findRuleByOrderMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/findRuleByOrderApi.js', () => ({
  findRuleByOrderApi: findRuleByOrderApiMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/persistRule.js', () => ({
  persistRule: persistRuleMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/buildRuleRecord.js', () => ({
  buildRuleRecord: buildRuleRecordMock,
}));

let registerEdgeServices: typeof import('../../../../src/services/edge/registerEdgeServices.js')['registerEdgeServices'];
let HttpError: typeof import('../../../../src/utils/http.js')['HttpError'];

beforeAll(async () => {
  ({ registerEdgeServices } = await import('../../../../src/services/edge/registerEdgeServices.js'));
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

describe('registerEdgeServices', () => {
  const deps = { state: {}, logger: {}, http: {}, apiBase: 'https://api.azion.com' } as any;

  it('cria edge application chamando ensure', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    ensureEdgeApplicationMock.mockResolvedValue({ created: true, record: { id: 'app-1', name: 'edge-app' } });
    buildEdgeApplicationToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'app' }] });

    registerEdgeServices(server as any, deps);

    const response = await handlers['azion.create_edge_application']({ name: 'edge-app' }, { sessionId: 'session-1' });

    expect(ensureEdgeApplicationMock).toHaveBeenCalledWith(expect.objectContaining({ name: 'edge-app' }), deps);
    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'Edge Application edge-app criada.' }),
      'session-1',
    );
    expect(response.content[0].text).toBe('app');
  });

  it('reaproveita connector já existente', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    findConnectorByNameMock.mockResolvedValue({ id: 'conn-1', name: 'connector' });
    buildEdgeConnectorToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'cached-connector' }] });

    registerEdgeServices(server as any, deps);

    const response = await handlers['azion.create_edge_connector']({ name: 'connector', bucketId: 'bucket-1' }, { sessionId: 'session-2' });

    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'Connector connector reutilizado do estado local.' }),
      'session-2',
    );
    expect(response.content[0].text).toBe('cached-connector');
    expect(ensureEdgeConnectorMock).not.toHaveBeenCalled();
  });

  it('cria connector quando não existir em cache', async () => {
    const { server, handlers } = setupServer();
    findConnectorByNameMock.mockResolvedValueOnce(undefined);
    resolveConnectorBucketMock.mockResolvedValue({ id: 'bucket-1', name: 'bucket-name' });
    ensureEdgeConnectorMock.mockResolvedValue({ created: true, record: { id: 'conn-2', name: 'connector' } });
    buildEdgeConnectorToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'connector-created' }] });

    registerEdgeServices(server as any, deps);

    const response = await handlers['azion.create_edge_connector']({ name: 'connector', bucketId: 'bucket-1' }, {});

    expect(resolveConnectorBucketMock).toHaveBeenCalledWith({ bucketId: 'bucket-1', bucketName: undefined });
    expect(ensureEdgeConnectorMock).toHaveBeenCalledWith(expect.objectContaining({ bucketId: 'bucket-1' }), deps);
    expect(response.content[0].text).toBe('connector-created');
  });

  it('cria regra de cache via ensure', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    ensureCacheRuleMock.mockResolvedValue({ created: true, record: { id: 'rule-1', edgeApplicationId: 'app-1' } });
    buildEdgeRuleToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'rule-created' }] });

    registerEdgeServices(server as any, deps);

    const response = await handlers['azion.create_cache_rule'](
      { edgeApplicationId: 'app-1', phase: 'request', order: 0, behaviors: [], criteria: [] },
      { sessionId: 'session-3' },
    );

    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: 'Regra criada para edgeApp=app-1.' }),
      'session-3',
    );
    expect(response.content[0].text).toBe('rule-created');
  });

  it('lida com conflito de regra reaproveitando cache', async () => {
    const { server, handlers } = setupServer();
    const conflict = new HttpError('conflict', 409, 'Conflict', null, { method: 'POST', url: 'x' });
    ensureCacheRuleMock.mockRejectedValue(conflict);
    findRuleByOrderMock.mockResolvedValue({ id: 'rule-cache', edgeApplicationId: 'app-1', phase: 'request', order: 0 });
    buildEdgeRuleToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'rule-cache' }] });

    registerEdgeServices(server as any, deps);

    const response = await handlers['azion.create_cache_rule'](
      { edgeApplicationId: 'app-1', phase: 'request', order: 0, behaviors: [], criteria: [] },
      {},
    );

    expect(response.content[0].text).toBe('rule-cache');
    expect(findRuleByOrderApiMock).not.toHaveBeenCalled();
  });

  it('sincroniza regra da API quando conflito sem cache local', async () => {
    const { server, handlers } = setupServer();
    const conflict = new HttpError('conflict', 409, 'Conflict', null, { method: 'POST', url: 'x' });
    ensureCacheRuleMock.mockRejectedValue(conflict);
    findRuleByOrderMock.mockResolvedValue(undefined);
    findRuleByOrderApiMock.mockResolvedValue({ id: 'rule-api', order: 0 });
    buildRuleRecordMock.mockReturnValue({ id: 'rule-api', edgeApplicationId: 'app-1' });
    persistRuleMock.mockResolvedValue({ id: 'rule-api', edgeApplicationId: 'app-1' });
    buildEdgeRuleToolResponseMock.mockReturnValue({ content: [{ type: 'text', text: 'rule-sync' }] });

    registerEdgeServices(server as any, deps);

    const response = await handlers['azion.create_cache_rule'](
      { edgeApplicationId: 'app-1', phase: 'request', order: 0, behaviors: [], criteria: [] },
      {},
    );

    expect(findRuleByOrderApiMock).toHaveBeenCalledWith('app-1', 'request', 0, deps);
    expect(persistRuleMock).toHaveBeenCalledWith(deps.state, { id: 'rule-api', edgeApplicationId: 'app-1' });
    expect(response.content[0].text).toBe('rule-sync');
  });
});
