import {
  configureWafInputSchema,
  wafStatusInputSchema,
  createFirewallInputSchema,
  createWafRulesetInputSchema,
  applyWafRulesetInputSchema,
} from '../../../../src/services/security/schemas.js';

describe('security schemas', () => {
  it('valida entrada de configureWaf com defaults', () => {
    const parsed = configureWafInputSchema.parse({ edgeApplicationId: 'edge-1' });
    expect(parsed).toMatchObject({ mode: 'blocking', enable: true });
  });

  it('valida schema de status do WAF', () => {
    const parsed = wafStatusInputSchema.parse({ edgeApplicationId: 'edge-1' });
    expect(parsed.edgeApplicationId).toBe('edge-1');
  });

  it('valida criação de firewall exigindo domínios', () => {
    const parsed = createFirewallInputSchema.parse({ name: 'firewall', domainIds: ['dom-1'] });
    expect(parsed.domainIds).toEqual(['dom-1']);
  });

  it('valida criação de ruleset com defaults', () => {
    const parsed = createWafRulesetInputSchema.parse({ name: 'ruleset' });
    expect(parsed.mode).toBe('blocking');
  });

  it('valida aplicação de ruleset com ordem padrão', () => {
    const parsed = applyWafRulesetInputSchema.parse({ firewallId: 'fw-1', rulesetId: 'ruleset-1' });
    expect(parsed.order).toBe(0);
  });
});
