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
    state.read.mockResolvedValue({ firewalls: { firewall: { id: 'fw-1' } } });
    const result = await findFirewallByName(state, 'firewall');
    expect(result).toEqual({ id: 'fw-1' });
  });

  it('localiza waf por edge application', async () => {
    state.read.mockResolvedValue({ policies: { 'edge-1': { wafId: 'waf-1' } } });
    const result = await findWaf(state, 'edge-1');
    expect(result).toEqual({ wafId: 'waf-1' });
  });

  it('localiza ruleset por nome', async () => {
    state.read.mockResolvedValue({ rulesets: { ruleset: { id: 'ruleset-1' } } });
    const result = await findWafRulesetByName(state, 'ruleset');
    expect(result).toEqual({ id: 'ruleset-1' });
  });
});
