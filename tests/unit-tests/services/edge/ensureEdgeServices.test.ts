import { jest } from '@jest/globals';

const findEdgeApplicationByNameMock = jest.fn();
const createEdgeApplicationViaApiMock = jest.fn();
const findConnectorByNameMock = jest.fn();
const createConnectorViaApiMock = jest.fn();
const findConnectorByNameApiMock = jest.fn();
const persistConnectorMock = jest.fn();
const buildConnectorRecordMock = jest.fn();
const findRuleByOrderMock = jest.fn();
const createRuleViaApiMock = jest.fn();
const findRuleByOrderApiMock = jest.fn();
const persistRuleMock = jest.fn();
const buildRuleRecordMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/edge/findEdgeApplicationByName.js', () => ({
  findEdgeApplicationByName: findEdgeApplicationByNameMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/createEdgeApplicationViaApi.js', () => ({
  createEdgeApplicationViaApi: createEdgeApplicationViaApiMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/findConnectorByName.js', () => ({
  findConnectorByName: findConnectorByNameMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/createConnectorViaApi.js', () => ({
  createConnectorViaApi: createConnectorViaApiMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/findConnectorByNameApi.js', () => ({
  findConnectorByNameApi: findConnectorByNameApiMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/persistConnector.js', () => ({
  persistConnector: persistConnectorMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/buildConnectorRecord.js', () => ({
  buildConnectorRecord: buildConnectorRecordMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/findRuleByOrder.js', () => ({
  findRuleByOrder: findRuleByOrderMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/createRuleViaApi.js', () => ({
  createRuleViaApi: createRuleViaApiMock,
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

type EdgeAppModule = typeof import('../../../../src/services/edge/ensureEdgeApplication.js');
type EdgeConnectorModule = typeof import('../../../../src/services/edge/ensureEdgeConnector.js');
type EdgeRuleModule = typeof import('../../../../src/services/edge/ensureCacheRule.js');
type HttpModule = typeof import('../../../../src/utils/http.js');

let ensureEdgeApplication: EdgeAppModule['ensureEdgeApplication'];
let ensureEdgeConnector: EdgeConnectorModule['ensureEdgeConnector'];
let ensureCacheRule: EdgeRuleModule['ensureCacheRule'];
let HttpError: HttpModule['HttpError'];

beforeAll(async () => {
  ({ ensureEdgeApplication } = await import('../../../../src/services/edge/ensureEdgeApplication.js'));
  ({ ensureEdgeConnector } = await import('../../../../src/services/edge/ensureEdgeConnector.js'));
  ({ ensureCacheRule } = await import('../../../../src/services/edge/ensureCacheRule.js'));
  ({ HttpError } = await import('../../../../src/utils/http.js'));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('edge ensure services', () => {
  describe('ensureEdgeApplication', () => {
    it('reutiliza edge application em cache', async () => {
      const cached = { id: 'edge-1', name: 'edge-app' };
      findEdgeApplicationByNameMock.mockResolvedValue(cached);

      const result = await ensureEdgeApplication({ name: 'edge-app' });

      expect(result).toEqual({ record: cached, created: false });
      expect(findEdgeApplicationByNameMock).toHaveBeenCalledTimes(1);
      expect(createEdgeApplicationViaApiMock).not.toHaveBeenCalled();
    });

    it('cria edge application quando inexistente', async () => {
      const created = { id: 'edge-2', name: 'edge-app' };
      findEdgeApplicationByNameMock.mockResolvedValue(undefined);
      createEdgeApplicationViaApiMock.mockResolvedValue(created);

      const result = await ensureEdgeApplication({ name: 'edge-app' });

      expect(result).toEqual({ record: created, created: true });
      expect(createEdgeApplicationViaApiMock).toHaveBeenCalledWith({ name: 'edge-app' }, expect.any(Object));
    });
  });

  describe('ensureEdgeConnector', () => {
    const baseInput = { name: 'connector', bucketId: 'bucket-1' };

    it('reutiliza connector em cache', async () => {
      const cached = { id: 'conn-1', name: 'connector' };
      findConnectorByNameMock.mockResolvedValue(cached);

      const result = await ensureEdgeConnector(baseInput);

      expect(result).toEqual({ record: cached, created: false });
      expect(createConnectorViaApiMock).not.toHaveBeenCalled();
    });

    it('cria connector quando inexistente', async () => {
      const created = { id: 'conn-2', name: 'connector' };
      findConnectorByNameMock.mockResolvedValue(undefined);
      createConnectorViaApiMock.mockResolvedValue(created);

      const result = await ensureEdgeConnector(baseInput);

      expect(result).toEqual({ record: created, created: true });
      expect(createConnectorViaApiMock).toHaveBeenCalledWith(baseInput, expect.any(Object));
    });

    it('reconsulta API quando houver conflito 409', async () => {
      const existing = { id: 'conn-3', name: 'connector' };
      const persisted = { id: 'conn-3', name: 'connector-persisted' };
      findConnectorByNameMock.mockResolvedValue(undefined);
      createConnectorViaApiMock.mockRejectedValue(new HttpError('conflict', 409, 'Conflict', null, { method: 'POST', url: 'http://example' }));
      findConnectorByNameApiMock.mockResolvedValue(existing);
      buildConnectorRecordMock.mockReturnValue(persisted);
      persistConnectorMock.mockResolvedValue(persisted);

      const result = await ensureEdgeConnector(baseInput);

      expect(findConnectorByNameApiMock).toHaveBeenCalledWith('connector', expect.any(Object));
      expect(persistConnectorMock).toHaveBeenCalledWith(expect.any(Object), persisted);
      expect(result).toEqual({ record: persisted, created: false });
    });
  });

  describe('ensureCacheRule', () => {
    const ruleInput = {
      edgeApplicationId: 'edge',
      phase: 'request' as const,
      order: 0,
      behaviors: [{ name: 'cache' }],
      criteria: [],
    };

    it('reutiliza regra existente em cache', async () => {
      const cached = { id: 'rule-1' };
      findRuleByOrderMock.mockResolvedValue(cached);

      const result = await ensureCacheRule(ruleInput);

      expect(result).toEqual({ record: cached, created: false });
      expect(createRuleViaApiMock).not.toHaveBeenCalled();
    });

    it('reconsulta API em caso de conflito 409', async () => {
      const existing = { id: 'rule-2' };
      const persisted = { id: 'rule-2', order: 0 };
      findRuleByOrderMock.mockResolvedValue(undefined);
      createRuleViaApiMock.mockRejectedValue(new HttpError('conflict', 409, 'Conflict', null, { method: 'POST', url: 'http://example' }));
      findRuleByOrderApiMock.mockResolvedValue(existing);
      buildRuleRecordMock.mockReturnValue(persisted);
      persistRuleMock.mockResolvedValue(persisted);

      const result = await ensureCacheRule(ruleInput);

      expect(findRuleByOrderApiMock).toHaveBeenCalledWith('edge', 'request', 0, expect.any(Object));
      expect(persistRuleMock).toHaveBeenCalledWith(expect.any(Object), persisted);
      expect(result).toEqual({ record: persisted, created: false });
    });
  });
});
