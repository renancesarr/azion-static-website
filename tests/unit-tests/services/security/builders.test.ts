import { buildFirewallRecord } from '../../../../src/services/security/buildFirewallRecord.js';
import { buildWafRecord } from '../../../../src/services/security/buildWafRecord.js';
import { buildWafRulesetRecord } from '../../../../src/services/security/buildWafRulesetRecord.js';
import { buildFirewallRuleBinding } from '../../../../src/services/security/buildFirewallRuleBinding.js';
import { jest } from '@jest/globals';

const statePathMock = jest.fn((value: string) => `/state/${value}`);

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  statePath: statePathMock,
}));

let buildFirewallToolResponse: typeof import('../../../../src/services/security/buildFirewallToolResponse.js')['buildFirewallToolResponse'];
let buildWafToolResponse: typeof import('../../../../src/services/security/buildWafToolResponse.js')['buildWafToolResponse'];
let buildWafRulesetToolResponse: typeof import('../../../../src/services/security/buildWafRulesetToolResponse.js')['buildWafRulesetToolResponse'];
let buildFirewallRuleToolResponse: typeof import('../../../../src/services/security/buildFirewallRuleToolResponse.js')['buildFirewallRuleToolResponse'];

beforeAll(async () => {
  ({ buildFirewallToolResponse } = await import('../../../../src/services/security/buildFirewallToolResponse.js'));
  ({ buildWafToolResponse } = await import('../../../../src/services/security/buildWafToolResponse.js'));
  ({ buildWafRulesetToolResponse } = await import('../../../../src/services/security/buildWafRulesetToolResponse.js'));
  ({ buildFirewallRuleToolResponse } = await import('../../../../src/services/security/buildFirewallRuleToolResponse.js'));
});

describe('security builders', () => {
  it('mapeia payload do firewall', () => {
    const record = buildFirewallRecord({
      id: 'fw-1',
      name: 'firewall',
      domains: ['dom-1'],
      is_active: true,
      created_at: 'now',
    } as any);

    expect(record).toMatchObject({
      id: 'fw-1',
      name: 'firewall',
      domainIds: ['dom-1'],
      isActive: true,
      createdAt: 'now',
    });
  });

  it('mapeia payload do WAF e ruleset', () => {
    const waf = buildWafRecord({
      id: 'waf-1',
      edge_application_id: 'edge-1',
      mode: 'blocking',
      enabled: true,
      updated_at: 'now',
    } as any);
    expect(waf).toMatchObject({
      wafId: 'waf-1',
      edgeApplicationId: 'edge-1',
      mode: 'blocking',
      enabled: true,
      updatedAt: 'now',
    });

    const ruleset = buildWafRulesetRecord({
      id: 'ruleset-1',
      name: 'default',
      mode: 'blocking',
      created_at: 'now',
    } as any);
    expect(ruleset).toMatchObject({
      id: 'ruleset-1',
      name: 'default',
      mode: 'blocking',
      createdAt: 'now',
    });
  });

  it('mapeia payload da regra de firewall', () => {
    const binding = buildFirewallRuleBinding(
      {
        id: 'rule-1',
        order: 1,
        created_at: 'now',
      } as any,
      'firewall-1',
      'ruleset-1',
    );

    expect(binding).toMatchObject({
      id: 'rule-1',
      firewallId: 'firewall-1',
      rulesetId: 'ruleset-1',
      order: 1,
      createdAt: 'now',
    });
  });

  it('monta respostas textuais incluindo statePath', () => {
    const fwResponse = buildFirewallToolResponse('Firewall', {
      id: 'fw-1',
      name: 'firewall',
      domainIds: ['dom-1'],
      createdAt: 'now',
      raw: {},
      isActive: true,
    } as any);
    expect(fwResponse.content[0].text).toContain('/state/security/firewalls.json');

    const wafResponse = buildWafToolResponse('WAF', {
      wafId: 'waf-1',
      edgeApplicationId: 'edge-1',
      mode: 'blocking',
      enabled: true,
      updatedAt: 'now',
      raw: {},
    } as any);
    expect(wafResponse.content[0].text).toContain('/state/security/waf_policies.json');

    const rulesetResponse = buildWafRulesetToolResponse('Ruleset', {
      id: 'ruleset-1',
      name: 'default',
      mode: 'blocking',
      createdAt: 'now',
      raw: {},
    } as any);
    expect(rulesetResponse.content[0].text).toContain('/state/security/waf_rulesets.json');

    const ruleResponse = buildFirewallRuleToolResponse('Binding', {
      id: 'rule-1',
      firewallId: 'firewall-1',
      rulesetId: 'ruleset-1',
      order: 1,
      createdAt: 'now',
      raw: {},
    } as any);
    expect(ruleResponse.content[0].text).toContain('/state/security/firewall_rules.json');
  });
});
