import * as edgeIndex from '../../../../src/services/edge/index.js';

describe('edge index exports', () => {
  it('exibe funções e schemas esperados', () => {
    expect(typeof edgeIndex.registerEdgeServices).toBe('function');
    expect(typeof edgeIndex.ensureEdgeApplication).toBe('function');
    expect(typeof edgeIndex.ensureEdgeConnector).toBe('function');
    expect(typeof edgeIndex.ensureCacheRule).toBe('function');
    expect(edgeIndex.createEdgeApplicationInputSchema).toBeDefined();
    expect(edgeIndex.createConnectorInputSchema).toBeDefined();
    expect(edgeIndex.createRuleInputSchema).toBeDefined();
    expect(edgeIndex.defaultEdgeDependencies).toBeDefined();
  });
});
