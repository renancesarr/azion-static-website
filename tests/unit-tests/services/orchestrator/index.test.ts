import * as orchestratorIndex from '../../../../src/services/orchestrator/index.js';

describe('orchestrator index exports', () => {
  it('exibe funções e schemas esperados', () => {
    expect(typeof orchestratorIndex.registerOrchestratorServices).toBe('function');
    expect(orchestratorIndex.orchestrateInputSchema).toBeDefined();
    expect(orchestratorIndex.connectorConfigSchema).toBeDefined();
    expect(orchestratorIndex.cacheRuleConfigSchema).toBeDefined();
    expect(orchestratorIndex.uploadConfigInputSchema).toBeDefined();
  });
});
