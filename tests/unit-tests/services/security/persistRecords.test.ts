import { jest } from '@jest/globals';
import { FirewallRecord } from '../../../../src/models/entities/firewallRecord.js';
import { WafPolicyRecord } from '../../../../src/models/entities/wafPolicyRecord.js';
import { WafRulesetRecord } from '../../../../src/models/entities/wafRulesetRecord.js';
import { FirewallRuleBinding } from '../../../../src/models/entities/firewallRuleBinding.js';
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
    const record = FirewallRecord.create({
      id: 'fw-1',
      name: 'firewall',
      domainIds: [],
      isActive: true,
      createdAt: 'now',
      raw: {},
    });

    await persistFirewall(state, record);

    expect(state.write).toHaveBeenCalledWith('security/firewalls.json', {
      firewalls: { firewall: record.toJSON() },
    });
  });

  it('persiste waf', async () => {
    state.read.mockResolvedValue({ policies: {} });
    const record = WafPolicyRecord.create({
      wafId: 'waf-1',
      edgeApplicationId: 'edge-1',
      mode: 'blocking',
      enabled: true,
      updatedAt: 'now',
      raw: {},
    });

    await persistWaf(state, record);

    expect(state.write).toHaveBeenCalledWith('security/waf_policies.json', {
      policies: { 'edge-1': record.toJSON() },
    });
  });

  it('persiste waf ruleset', async () => {
    state.read.mockResolvedValue({ rulesets: {} });
    const record = WafRulesetRecord.create({
      id: 'ruleset-1',
      name: 'ruleset',
      mode: 'blocking',
      createdAt: 'now',
      raw: {},
    });

    await persistWafRuleset(state, record);

    expect(state.write).toHaveBeenCalledWith('security/waf_rulesets.json', {
      rulesets: { ruleset: record.toJSON() },
    });
  });

  it('persiste binding de firewall e recupera do estado', async () => {
    state.read.mockResolvedValue({ bindings: {} });
    const binding = FirewallRuleBinding.create({
      id: 'rule-1',
      firewallId: 'fw-1',
      rulesetId: 'ruleset-1',
      order: 0,
      createdAt: 'now',
      raw: {},
    });

    await persistFirewallRule(state, binding);

    expect(state.write).toHaveBeenCalledWith('security/firewall_rules.json', {
      bindings: { 'fw-1:ruleset-1': binding.toJSON() },
    });

    state.read.mockResolvedValue({ bindings: { 'fw-1:ruleset-1': binding.toJSON() } });
    const cached = await findFirewallRuleBindingFromState(state, 'fw-1', 'ruleset-1');
    expect(cached).toBeInstanceOf(FirewallRuleBinding);
    expect(cached).toMatchObject({ id: 'rule-1', firewallId: 'fw-1', rulesetId: 'ruleset-1' });
  });
});
