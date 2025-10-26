import {
  EDGE_APP_STATE_FILE,
  EDGE_CONNECTOR_STATE_FILE,
  EDGE_RULE_STATE_FILE,
} from '../../../../src/services/edge/constants.js';

describe('edge constants', () => {
  it('define caminhos de estado', () => {
    expect(EDGE_APP_STATE_FILE).toBe('edge/edge_applications.json');
    expect(EDGE_CONNECTOR_STATE_FILE).toBe('edge/edge_connectors.json');
    expect(EDGE_RULE_STATE_FILE).toBe('edge/rules_engine.json');
  });
});
