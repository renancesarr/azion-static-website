import {
  orchestrateInputSchema,
  connectorConfigSchema,
  cacheRuleConfigSchema,
  uploadConfigInputSchema,
} from '../../../../src/services/orchestrator/schemas.js';

describe('orchestrator schemas', () => {
  it('aplica defaults na configuração do connector', () => {
    const parsed = connectorConfigSchema.parse({ name: 'connector' });
    expect(parsed).toMatchObject({ name: 'connector' });
  });

  it('preenche defaults para regras de cache', () => {
    const parsed = cacheRuleConfigSchema.parse({});
    expect(parsed.phase).toBe('request');
    expect(parsed.behaviors).toEqual([]);
    expect(parsed.criteria).toEqual([]);
  });

  it('aceita upload config mínima', () => {
    const parsed = uploadConfigInputSchema.parse({ localDir: './dist' });
    expect(parsed.localDir).toBe('./dist');
  });

  it('valida entrada do orquestrador com defaults', () => {
    const parsed = orchestrateInputSchema.parse({
      project: 'site',
      bucket: { name: 'bucket-1' },
      edgeApplication: { name: 'edge-app' },
      connector: { name: 'connector', bucketId: 'bucket-1' },
      domain: { name: 'example.com' },
      firewall: {},
    });

    expect(parsed.dryRun).toBe(false);
    expect(parsed.cacheRules).toEqual([]);
  });
});
