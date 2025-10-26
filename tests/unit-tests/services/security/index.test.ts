import * as securityIndex from '../../../../src/services/security/index.js';

describe('security index exports', () => {
  it('expõe funções e schemas esperados', () => {
    expect(typeof securityIndex.registerSecurityServices).toBe('function');
    expect(typeof securityIndex.ensureWaf).toBe('function');
    expect(typeof securityIndex.ensureFirewall).toBe('function');
    expect(typeof securityIndex.ensureWafRuleset).toBe('function');
    expect(typeof securityIndex.ensureFirewallRule).toBe('function');
    expect(securityIndex.configureWafInputSchema).toBeDefined();
    expect(securityIndex.createFirewallInputSchema).toBeDefined();
    expect(securityIndex.createWafRulesetInputSchema).toBeDefined();
    expect(securityIndex.applyWafRulesetInputSchema).toBeDefined();
    expect(securityIndex.defaultSecurityDependencies).toBeDefined();
  });
});
