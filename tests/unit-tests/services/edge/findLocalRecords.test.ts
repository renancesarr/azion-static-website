import { jest } from '@jest/globals';
import { findEdgeApplicationByName } from '../../../../src/services/edge/findEdgeApplicationByName.js';
import { findConnectorByName } from '../../../../src/services/edge/findConnectorByName.js';
import { findRuleByOrder } from '../../../../src/services/edge/findRuleByOrder.js';

describe('edge local finders', () => {
  const state = {
    read: jest.fn(),
  } as any;

  beforeEach(() => {
    state.read.mockReset();
  });

  it('localiza edge application por nome', async () => {
    state.read.mockResolvedValue({ applications: { app: { id: 'app-1' } } });

    const result = await findEdgeApplicationByName(state, 'app');

    expect(result).toEqual({ id: 'app-1' });
  });

  it('localiza connector por nome', async () => {
    state.read.mockResolvedValue({ connectors: { connector: { id: 'conn-1' } } });

    const result = await findConnectorByName(state, 'connector');

    expect(result).toEqual({ id: 'conn-1' });
  });

  it('localiza regra por order', async () => {
    state.read.mockResolvedValue({ rules: { 'rule-1': { id: 'rule-1', edgeApplicationId: 'app', phase: 'request', order: 1 } } });

    const result = await findRuleByOrder(state, 'app', 'request', 1);

    expect(result).toEqual({ id: 'rule-1', edgeApplicationId: 'app', phase: 'request', order: 1 });
  });
});
