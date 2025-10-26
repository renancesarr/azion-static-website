import { jest } from '@jest/globals';
import { EdgeApplicationRecord } from '../../../../src/models/entities/edgeApplicationRecord.js';
import { EdgeConnectorRecord } from '../../../../src/models/entities/edgeConnectorRecord.js';
import { EdgeRuleRecord } from '../../../../src/models/entities/edgeRuleRecord.js';
import { persistEdgeApplication } from '../../../../src/services/edge/persistEdgeApplication.js';
import { persistConnector } from '../../../../src/services/edge/persistConnector.js';
import { persistRule } from '../../../../src/services/edge/persistRule.js';

describe('edge persist helpers', () => {
  const state = {
    read: jest.fn(),
    write: jest.fn(),
  } as any;

  beforeEach(() => {
    state.read.mockReset();
    state.write.mockReset();
  });

  it('persiste edge application', async () => {
    state.read.mockResolvedValue({ applications: {} });
    const record = EdgeApplicationRecord.hydrate({
      id: 'app-1',
      name: 'edge-app',
      deliveryProtocol: 'http-and-https',
      originProtocol: 'https',
      caching: {},
      enableWaf: true,
      createdAt: 'now',
      raw: {},
    });

    await persistEdgeApplication(state, record);

    expect(state.write).toHaveBeenCalledWith('edge/edge_applications.json', {
      applications: { 'edge-app': record.toJSON() },
    });
  });

  it('persiste connector', async () => {
    state.read.mockResolvedValue({ connectors: {} });
    const record = EdgeConnectorRecord.hydrate({
      id: 'conn-1',
      name: 'edge-connector',
      bucketId: 'bucket-1',
      bucketName: 'bucket',
      originPath: '/',
      createdAt: 'now',
      raw: {},
    });

    await persistConnector(state, record);

    expect(state.write).toHaveBeenCalledWith('edge/edge_connectors.json', {
      connectors: { 'edge-connector': record.toJSON() },
    });
  });

  it('persiste regra', async () => {
    state.read.mockResolvedValue({ rules: {} });
    const record = EdgeRuleRecord.hydrate({
      id: 'rule-1',
      edgeApplicationId: 'app-1',
      phase: 'request',
      order: 1,
      createdAt: 'now',
      raw: {},
    });

    await persistRule(state, record);

    expect(state.write).toHaveBeenCalledWith('edge/rules_engine.json', {
      rules: { 'rule-1': record.toJSON() },
    });
  });
});
