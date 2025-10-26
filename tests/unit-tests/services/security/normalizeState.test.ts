import { normalizeFirewallState } from '../../../../src/services/security/normalizeFirewallState.js';
import { normalizeFirewallRuleState } from '../../../../src/services/security/normalizeFirewallRuleState.js';
import { normalizeWafState } from '../../../../src/services/security/normalizeWafState.js';
import { normalizeWafRulesetState } from '../../../../src/services/security/normalizeWafRulesetState.js';

describe('security normalize state helpers', () => {
  it('normaliza firewall state', () => {
    expect(normalizeFirewallState()).toEqual({ firewalls: {} });
    expect(normalizeFirewallState({ firewalls: { fw: { id: 'fw-1' } } }).firewalls.fw).toEqual({ id: 'fw-1' });
  });

  it('normaliza firewall rule state', () => {
    expect(normalizeFirewallRuleState()).toEqual({ bindings: {} });
    expect(normalizeFirewallRuleState({ bindings: { key: { id: 'rule-1' } } }).bindings.key).toEqual({ id: 'rule-1' });
  });

  it('normaliza waf state', () => {
    expect(normalizeWafState()).toEqual({ policies: {} });
    expect(normalizeWafState({ policies: { 'edge-1': { wafId: 'waf-1' } } }).policies['edge-1']).toEqual({
      wafId: 'waf-1',
    });
  });

  it('normaliza waf ruleset state', () => {
    expect(normalizeWafRulesetState()).toEqual({ rulesets: {} });
    expect(normalizeWafRulesetState({ rulesets: { ruleset: { id: 'ruleset-1' } } }).rulesets.ruleset).toEqual({
      id: 'ruleset-1',
    });
  });
});
