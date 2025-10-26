import {
  createEdgeApplicationInputSchema,
  createConnectorInputSchema,
  createRuleInputSchema,
} from '../../../../src/services/edge/schemas.js';

describe('edge schemas', () => {
  it('aplica padrões na criação da edge application', () => {
    const parsed = createEdgeApplicationInputSchema.parse({ name: 'edge-app' });
    expect(parsed).toMatchObject({ deliveryProtocol: 'http-and-https', originProtocol: 'https', enableWaf: true });
  });

  it('valida obrigatoriedade de bucket no connector', () => {
    const parsed = createConnectorInputSchema.parse({ name: 'connector', bucketId: 'bucket-1' });
    expect(parsed.bucketId).toBe('bucket-1');
  });

  it('aplica defaults na criação de regra', () => {
    const parsed = createRuleInputSchema.parse({
      edgeApplicationId: 'app-1',
      behaviors: [{ name: 'cache' }],
      criteria: [],
    });

    expect(parsed.order).toBe(0);
    expect(parsed.phase).toBe('request');
  });
});
