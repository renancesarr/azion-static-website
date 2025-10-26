import {
  WAF_STATE_FILE,
  FIREWALL_STATE_FILE,
  WAF_RULESET_STATE_FILE,
  FIREWALL_RULE_STATE_FILE,
} from '../../../../src/services/security/constants.js';

describe('security constants', () => {
  it('define caminhos de estado esperados', () => {
    expect(WAF_STATE_FILE).toBe('security/waf_policies.json');
    expect(FIREWALL_STATE_FILE).toBe('security/firewalls.json');
    expect(WAF_RULESET_STATE_FILE).toBe('security/waf_rulesets.json');
    expect(FIREWALL_RULE_STATE_FILE).toBe('security/firewall_rules.json');
  });
});
