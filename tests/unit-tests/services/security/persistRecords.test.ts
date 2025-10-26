import { jest } from '@jest/globals';
import { persistFirewall } from '../../../../src/services/security/persistFirewall.js';
import { persistWaf } from '../../../../src/services/security/persistWaf.js';
import { persistWafRuleset } from '../../../../src/services/security/persistWafRuleset.js';
import {
  persistFirewallRule,
  findFirewallRuleBindingFromState,
} from '../../../../src/services/security/persistFirewallRule.js';

describe('security persistence helpers', () => {
  const state = {
    read: jest.fn(),
    write: jest.fn(),
  } as any;

  beforeEach(() => {
    state.read.mockReset();
    state.write.mockReset();
  });

  it('persiste firewall', async () => {
    state.read.mockResolvedValue({ firewalls: {} });
    const record = { id: 'fw-1', name: 'firewall', domainIds: [], isActive: true, createdAt: 'now', raw: {} };

    await persistFirewall(state, record);

    expect(state.write).toHaveBeenCalledWith('security/firewalls.json', { firewalls: { firewall: record } });
  });

  it('persiste waf', async () => {
    state.read.mockResolvedValue({ policies: {} });
    const record = {
      wafId: 'waf-1',
      edgeApplicationId: 'edge-1',
      mode: 'blocking',
      enabled: true,
      updatedAt: 'now',
      raw: {},
    };

    await persistWaf(state, record);

    expect(state.write).toHaveBeenCalledWith('security/waf_policies.json', {
      policies: { 'edge-1': record },
    });
  });

  it('persiste waf ruleset', async () => {
    state.read.mockResolvedValue({ rulesets: {} });
    const record = { id: 'ruleset-1', name: 'ruleset', mode: 'blocking', createdAt: 'now', raw: {} };

    await persistWafRuleset(state, record);

    expect(state.write).toHaveBeenCalledWith('security/waf_rulesets.json', {
      rulesets: { ruleset: record },
    });
  });

  it('persiste binding de firewall e recupera do estado', async () => {
    state.read.mockResolvedValue({ bindings: {} });
    const binding = {
      id: 'rule-1',
      firewallId: 'fw-1',
      rulesetId: 'ruleset-1',
      order: 0,
      createdAt: 'now',
      raw: {},
    };

    await persistFirewallRule(state, binding);

    expect(state.write).toHaveBeenCalledWith('security/firewall_rules.json', {
      bindings: { 'fw-1:ruleset-1': binding },
    });

    state.read.mockResolvedValue({ bindings: { 'fw-1:ruleset-1': binding } });
    const cached = await findFirewallRuleBindingFromState(state, 'fw-1', 'ruleset-1');
    expect(cached).toEqual(binding);
  });
});
