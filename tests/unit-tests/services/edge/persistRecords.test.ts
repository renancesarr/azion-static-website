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
    const record = { id: 'app-1', name: 'edge-app', createdAt: 'now', raw: {} } as any;

    await persistEdgeApplication(state, record);

    expect(state.write).toHaveBeenCalledWith('edge/edge_applications.json', {
      applications: { 'edge-app': record },
    });
  });

  it('persiste connector', async () => {
    state.read.mockResolvedValue({ connectors: {} });
    const record = { id: 'conn-1', name: 'edge-connector', createdAt: 'now', raw: {} } as any;

    await persistConnector(state, record);

    expect(state.write).toHaveBeenCalledWith('edge/edge_connectors.json', {
      connectors: { 'edge-connector': record },
    });
  });

  it('persiste regra', async () => {
    state.read.mockResolvedValue({ rules: {} });
    const record = { id: 'rule-1', edgeApplicationId: 'app-1', createdAt: 'now', raw: {} } as any;

    await persistRule(state, record);

    expect(state.write).toHaveBeenCalledWith('edge/rules_engine.json', {
      rules: { 'rule-1': record },
    });
  });
});
