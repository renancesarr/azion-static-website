import { buildEdgeApplicationRecord } from '../../../../src/services/edge/buildEdgeApplicationRecord.js';
import { buildConnectorRecord } from '../../../../src/services/edge/buildConnectorRecord.js';
import { buildRuleRecord } from '../../../../src/services/edge/buildRuleRecord.js';
import { jest } from '@jest/globals';

const statePathMock = jest.fn((value: string) => `/state/${value}`);

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  statePath: statePathMock,
}));

let buildEdgeApplicationToolResponse: typeof import('../../../../src/services/edge/buildEdgeApplicationToolResponse.js')['buildEdgeApplicationToolResponse'];
let buildEdgeConnectorToolResponse: typeof import('../../../../src/services/edge/buildEdgeConnectorToolResponse.js')['buildEdgeConnectorToolResponse'];
let buildEdgeRuleToolResponse: typeof import('../../../../src/services/edge/buildEdgeRuleToolResponse.js')['buildEdgeRuleToolResponse'];

beforeAll(async () => {
  ({ buildEdgeApplicationToolResponse } = await import('../../../../src/services/edge/buildEdgeApplicationToolResponse.js'));
  ({ buildEdgeConnectorToolResponse } = await import('../../../../src/services/edge/buildEdgeConnectorToolResponse.js'));
  ({ buildEdgeRuleToolResponse } = await import('../../../../src/services/edge/buildEdgeRuleToolResponse.js'));
});

describe('edge builders', () => {
  it('mapeia payload da Edge Application', () => {
    const now = new Date().toISOString();
    const record = buildEdgeApplicationRecord({
      id: 'app-1',
      name: 'edge-app',
      delivery_protocol: 'http-and-https',
      origin_protocol_policy: 'https',
      caching: { browserCacheSettings: 'override' },
      waf: { active: true },
      created_at: now,
    } as any);

    expect(record).toMatchObject({
      id: 'app-1',
      name: 'edge-app',
      enableWaf: true,
      createdAt: now,
    });
  });

  it('mapeia payload do connector preenchendo bucket', () => {
    const record = buildConnectorRecord({ id: 'conn-1', name: 'connector', origin_path: '/', created_at: 'now' } as any, 'bucket-1', 'bucket-name');
    expect(record).toMatchObject({ id: 'conn-1', bucketId: 'bucket-1', bucketName: 'bucket-name' });
  });

  it('mapeia payload da regra', () => {
    const record = buildRuleRecord({ id: 'rule-1', phase: 'request', order: 1, created_at: 'now' } as any, 'app-1');
    expect(record).toMatchObject({ id: 'rule-1', edgeApplicationId: 'app-1', order: 1 });
  });

  it('monta respostas textuais utilizando statePath', () => {
    const appResponse = buildEdgeApplicationToolResponse('Mensagem', {
      id: 'app-1',
      name: 'edge-app',
      enableWaf: true,
      createdAt: 'now',
      raw: {},
    } as any);
    expect(appResponse.content[0].text).toContain('/state/edge/edge_applications.json');

    const connectorResponse = buildEdgeConnectorToolResponse('Connector', {
      id: 'conn-1',
      name: 'connector',
      bucketId: 'bucket-1',
      createdAt: 'now',
      raw: {},
    } as any);
    expect(connectorResponse.content[0].text).toContain('/state/edge/edge_connectors.json');

    const ruleResponse = buildEdgeRuleToolResponse('Rule', {
      id: 'rule-1',
      edgeApplicationId: 'app-1',
      phase: 'request',
      order: 0,
      createdAt: 'now',
      raw: {},
    } as any);
    expect(ruleResponse.content[0].text).toContain('/state/edge/rules_engine.json');
  });
});
