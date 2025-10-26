import { jest } from '@jest/globals';

const persistRuleMock = jest.fn();
const buildRuleRecordMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/edge/persistRule.js', () => ({
  persistRule: persistRuleMock,
}));

jest.unstable_mockModule('../../../../src/services/edge/buildRuleRecord.js', () => ({
  buildRuleRecord: buildRuleRecordMock,
}));

let createRuleViaApi: typeof import('../../../../src/services/edge/createRuleViaApi.js')['createRuleViaApi'];

beforeAll(async () => {
  ({ createRuleViaApi } = await import('../../../../src/services/edge/createRuleViaApi.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createRuleViaApi', () => {
  const deps = {
    apiBase: 'https://api.azion.com',
    http: {
      request: jest.fn(),
    },
    state: {},
  } as any;

  it('envia requisição e persiste regra', async () => {
    deps.http.request.mockResolvedValue({ data: { results: { id: 'rule-1', order: 1 } } });
    buildRuleRecordMock.mockReturnValue({ id: 'rule-1', edgeApplicationId: 'app-1' });
    persistRuleMock.mockResolvedValue({ id: 'rule-1', edgeApplicationId: 'app-1' });

    const result = await createRuleViaApi(
      { edgeApplicationId: 'app-1', phase: 'request', order: 1, behaviors: [], criteria: [] } as any,
      deps,
    );

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.azion.com/v4/edge_applications/app-1/rules_engine/request/rules',
      body: expect.objectContaining({ order: 1 }),
    });
    expect(result).toEqual({ id: 'rule-1', edgeApplicationId: 'app-1' });
  });
});
