import { normalizeEdgeApplicationState } from '../../../../src/services/edge/normalizeEdgeApplicationState.js';
import { normalizeConnectorState } from '../../../../src/services/edge/normalizeConnectorState.js';
import { normalizeRuleState } from '../../../../src/services/edge/normalizeRuleState.js';

describe('edge normalize state helpers', () => {
  it('normaliza edge application state', () => {
    expect(normalizeEdgeApplicationState()).toEqual({ applications: {} });
    expect(normalizeEdgeApplicationState({ applications: { app: { id: '1' } } }).applications.app).toEqual({ id: '1' });
  });

  it('normaliza connector state', () => {
    expect(normalizeConnectorState()).toEqual({ connectors: {} });
    expect(normalizeConnectorState({ connectors: { conn: { id: '1' } } }).connectors.conn).toEqual({ id: '1' });
  });

  it('normaliza rule state', () => {
    expect(normalizeRuleState()).toEqual({ rules: {} });
    expect(normalizeRuleState({ rules: { rule: { id: '1' } } }).rules.rule).toEqual({ id: '1' });
  });
});
