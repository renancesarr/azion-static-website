import { jest } from '@jest/globals';
import { FirewallRecord } from '../../../../src/models/entities/firewallRecord.js';
import { WafPolicyRecord } from '../../../../src/models/entities/wafPolicyRecord.js';
import { WafRulesetRecord } from '../../../../src/models/entities/wafRulesetRecord.js';
import { findFirewallByName } from '../../../../src/services/security/findFirewallByName.js';
import { findWaf } from '../../../../src/services/security/findWaf.js';
import { findWafRulesetByName } from '../../../../src/services/security/findWafRulesetByName.js';

describe('security local finders', () => {
  const state = {
    read: jest.fn(),
  } as any;

  beforeEach(() => {
    state.read.mockReset();
  });

  it('localiza firewall por nome', async () => {
    const firewall = FirewallRecord.create({
      id: 'fw-1',
      name: 'firewall',
      domainIds: [],
      isActive: true,
      createdAt: 'now',
      raw: {},
    });
    state.read.mockResolvedValue({ firewalls: { firewall: firewall.toJSON() } });
    const result = await findFirewallByName(state, 'firewall');
    expect(result).toBeInstanceOf(FirewallRecord);
    expect(result).toMatchObject({ id: 'fw-1' });
  });

  it('localiza waf por edge application', async () => {
    const waf = WafPolicyRecord.create({
      edgeApplicationId: 'edge-1',
      wafId: 'waf-1',
      mode: 'blocking',
      enabled: true,
      updatedAt: 'now',
      raw: {},
    });
    state.read.mockResolvedValue({ policies: { 'edge-1': waf.toJSON() } });
    const result = await findWaf(state, 'edge-1');
    expect(result).toBeInstanceOf(WafPolicyRecord);
    expect(result).toMatchObject({ wafId: 'waf-1' });
  });

  it('localiza ruleset por nome', async () => {
    const ruleset = WafRulesetRecord.create({
      id: 'ruleset-1',
      name: 'ruleset',
      mode: 'blocking',
      createdAt: 'now',
      raw: {},
    });
    state.read.mockResolvedValue({ rulesets: { ruleset: ruleset.toJSON() } });
    const result = await findWafRulesetByName(state, 'ruleset');
    expect(result).toBeInstanceOf(WafRulesetRecord);
    expect(result).toMatchObject({ id: 'ruleset-1' });
  });
});
