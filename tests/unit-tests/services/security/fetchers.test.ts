import { fetchWafByEdgeAppApi } from '../../../../src/services/security/fetchWafByEdgeAppApi.js';
import { fetchFirewallByNameApi } from '../../../../src/services/security/fetchFirewallByNameApi.js';
import { fetchWafRulesetByNameApi } from '../../../../src/services/security/fetchWafRulesetByNameApi.js';
import { fetchFirewallRulesApi } from '../../../../src/services/security/fetchFirewallRulesApi.js';

describe('security fetchers', () => {
  const deps = {
    apiBase: 'https://api.azion.com',
    http: {
      request: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    deps.http.request.mockReset();
  });

  it('busca politica WAF da edge application', async () => {
    const policy = { id: 'waf-1', edge_application_id: 'edge-1' };
    deps.http.request.mockResolvedValue({ data: { results: [policy] } });

    const result = await fetchWafByEdgeAppApi('edge-1', deps);

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.azion.com/v4/waf/policies?edge_application_id=edge-1',
    });
    expect(result).toEqual(policy);
  });

  it('busca firewall por nome', async () => {
    const firewall = { id: 'fw-1', name: 'firewall' };
    deps.http.request.mockResolvedValue({ data: { results: [firewall] } });

    const result = await fetchFirewallByNameApi('firewall', deps);

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.azion.com/v4/edge_firewall/firewalls?name=firewall',
    });
    expect(result).toEqual(firewall);
  });

  it('busca ruleset por nome', async () => {
    const ruleset = { id: 'ruleset-1', name: 'ruleset' };
    deps.http.request.mockResolvedValue({ data: { results: [ruleset] } });

    const result = await fetchWafRulesetByNameApi('ruleset', deps);

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.azion.com/v4/waf/rulesets?name=ruleset',
    });
    expect(result).toEqual(ruleset);
  });

  it('busca regras de firewall', async () => {
    const rules = [{ id: 'rule-1' }];
    deps.http.request.mockResolvedValue({ data: { results: rules } });

    const result = await fetchFirewallRulesApi('fw-1', deps);

    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.azion.com/v4/edge_firewall/firewalls/fw-1/rules',
    });
    expect(result).toEqual(rules);
  });
});
