import { jest } from '@jest/globals';

const resolveDomainIdsMock = jest.fn();
const buildFirewallRecordMock = jest.fn();
const persistFirewallMock = jest.fn();
const fetchFirewallByNameApiMock = jest.fn();

const buildWafRecordMock = jest.fn();
const persistWafMock = jest.fn();
const fetchWafByEdgeAppApiMock = jest.fn();

const buildWafRulesetRecordMock = jest.fn();
const persistWafRulesetMock = jest.fn();
const fetchWafRulesetByNameApiMock = jest.fn();

const buildFirewallRuleBindingMock = jest.fn();
const persistFirewallRuleMock = jest.fn();
const fetchFirewallRulesApiMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/security/resolveDomainIds.js', () => ({
  resolveDomainIds: resolveDomainIdsMock,
}));

jest.unstable_mockModule('../../../../src/services/security/buildFirewallRecord.js', () => ({
  buildFirewallRecord: buildFirewallRecordMock,
}));

jest.unstable_mockModule('../../../../src/services/security/persistFirewall.js', () => ({
  persistFirewall: persistFirewallMock,
}));

jest.unstable_mockModule('../../../../src/services/security/fetchFirewallByNameApi.js', () => ({
  fetchFirewallByNameApi: fetchFirewallByNameApiMock,
}));

jest.unstable_mockModule('../../../../src/services/security/buildWafRecord.js', () => ({
  buildWafRecord: buildWafRecordMock,
}));

jest.unstable_mockModule('../../../../src/services/security/persistWaf.js', () => ({
  persistWaf: persistWafMock,
}));

jest.unstable_mockModule('../../../../src/services/security/fetchWafByEdgeAppApi.js', () => ({
  fetchWafByEdgeAppApi: fetchWafByEdgeAppApiMock,
}));

jest.unstable_mockModule('../../../../src/services/security/buildWafRulesetRecord.js', () => ({
  buildWafRulesetRecord: buildWafRulesetRecordMock,
}));

jest.unstable_mockModule('../../../../src/services/security/persistWafRuleset.js', () => ({
  persistWafRuleset: persistWafRulesetMock,
}));

jest.unstable_mockModule('../../../../src/services/security/fetchWafRulesetByNameApi.js', () => ({
  fetchWafRulesetByNameApi: fetchWafRulesetByNameApiMock,
}));

jest.unstable_mockModule('../../../../src/services/security/buildFirewallRuleBinding.js', () => ({
  buildFirewallRuleBinding: buildFirewallRuleBindingMock,
}));

jest.unstable_mockModule('../../../../src/services/security/persistFirewallRule.js', () => ({
  persistFirewallRule: persistFirewallRuleMock,
}));

jest.unstable_mockModule('../../../../src/services/security/fetchFirewallRulesApi.js', () => ({
  fetchFirewallRulesApi: fetchFirewallRulesApiMock,
}));

let createFirewallViaApi: typeof import('../../../../src/services/security/createFirewallViaApi.js')['createFirewallViaApi'];
let configureWafViaApi: typeof import('../../../../src/services/security/configureWafViaApi.js')['configureWafViaApi'];
let createWafRulesetViaApi: typeof import('../../../../src/services/security/createWafRulesetViaApi.js')['createWafRulesetViaApi'];
let applyWafRulesetViaApi: typeof import('../../../../src/services/security/applyWafRulesetViaApi.js')['applyWafRulesetViaApi'];
let HttpError: typeof import('../../../../src/utils/http.js')['HttpError'];

beforeAll(async () => {
  ({ createFirewallViaApi } = await import('../../../../src/services/security/createFirewallViaApi.js'));
  ({ configureWafViaApi } = await import('../../../../src/services/security/configureWafViaApi.js'));
  ({ createWafRulesetViaApi } = await import('../../../../src/services/security/createWafRulesetViaApi.js'));
  ({ applyWafRulesetViaApi } = await import('../../../../src/services/security/applyWafRulesetViaApi.js'));
  ({ HttpError } = await import('../../../../src/utils/http.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('security API operations', () => {
  const deps = {
    apiBase: 'https://api.azion.com',
    http: {
      request: jest.fn(),
    },
    state: {},
  } as any;

  it('cria firewall e persiste registro', async () => {
    resolveDomainIdsMock.mockResolvedValue(['dom-1']);
    deps.http.request.mockResolvedValue({ data: { results: { id: 'fw-1' } } });
    buildFirewallRecordMock.mockReturnValue({ id: 'fw-1' });
    persistFirewallMock.mockResolvedValue({ id: 'fw-1' });

    const result = await createFirewallViaApi({ name: 'firewall' } as any, deps);

    expect(resolveDomainIdsMock).toHaveBeenCalled();
    expect(deps.http.request).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.azion.com/v4/edge_firewall/firewalls',
      body: expect.objectContaining({ name: 'firewall', domains: ['dom-1'] }),
    });
    expect(result).toEqual({ id: 'fw-1' });
  });

  it('reaproveita firewall existente quando API retorna 409', async () => {
    resolveDomainIdsMock.mockResolvedValue(['dom-1']);
    deps.http.request.mockRejectedValue(new HttpError('conflict', 409, 'Conflict', null, { method: 'POST', url: 'x' }));
    fetchFirewallByNameApiMock.mockResolvedValue({ id: 'fw-existing' });
    buildFirewallRecordMock.mockReturnValue({ id: 'fw-existing' });
    persistFirewallMock.mockResolvedValue({ id: 'fw-existing' });

    const result = await createFirewallViaApi({ name: 'firewall' } as any, deps);

    expect(fetchFirewallByNameApiMock).toHaveBeenCalledWith('firewall', deps);
    expect(result).toEqual({ id: 'fw-existing' });
  });

  it('configura WAF, reaproveitando em caso de conflito', async () => {
    deps.http.request.mockResolvedValue({ data: { results: { id: 'waf-1', edge_application_id: 'edge-1' } } });
    buildWafRecordMock.mockReturnValue({ wafId: 'waf-1' });
    persistWafMock.mockResolvedValue({ wafId: 'waf-1' });

    const created = await configureWafViaApi({ edgeApplicationId: 'edge-1', enable: true, mode: 'blocking' }, deps);
    expect(created).toEqual({ wafId: 'waf-1' });

    deps.http.request.mockRejectedValue(new HttpError('conflict', 409, 'Conflict', null, { method: 'POST', url: 'x' }));
    fetchWafByEdgeAppApiMock.mockResolvedValue({ id: 'waf-2', edge_application_id: 'edge-1' } as any);
    buildWafRecordMock.mockReturnValue({ wafId: 'waf-2' });
    persistWafMock.mockResolvedValue({ wafId: 'waf-2' });

    const reused = await configureWafViaApi({ edgeApplicationId: 'edge-1' } as any, deps);
    expect(reused).toEqual({ wafId: 'waf-2' });
  });

  it('cria ruleset WAF e lida com conflito', async () => {
    deps.http.request.mockResolvedValue({ data: { results: { id: 'ruleset-1', name: 'ruleset' } } });
    buildWafRulesetRecordMock.mockReturnValue({ id: 'ruleset-1' });
    persistWafRulesetMock.mockResolvedValue({ id: 'ruleset-1' });

    const result = await createWafRulesetViaApi({ name: 'ruleset', mode: 'blocking' }, deps);
    expect(result).toEqual({ id: 'ruleset-1' });

    deps.http.request.mockRejectedValue(new HttpError('conflict', 409, 'Conflict', null, { method: 'POST', url: 'x' }));
    fetchWafRulesetByNameApiMock.mockResolvedValue({ id: 'ruleset-existing', name: 'ruleset' } as any);
    buildWafRulesetRecordMock.mockReturnValue({ id: 'ruleset-existing' });
    persistWafRulesetMock.mockResolvedValue({ id: 'ruleset-existing' });

    const reuse = await createWafRulesetViaApi({ name: 'ruleset', mode: 'blocking' }, deps);
    expect(reuse).toEqual({ id: 'ruleset-existing' });
  });

  it('aplica ruleset ao firewall e trata conflito', async () => {
    deps.http.request.mockResolvedValue({ data: { results: { id: 'rule-1', order: 0 } } });
    buildFirewallRuleBindingMock.mockReturnValue({ id: 'rule-1' });
    persistFirewallRuleMock.mockResolvedValue({ id: 'rule-1' });

    const binding = await applyWafRulesetViaApi({ firewallId: 'fw-1', rulesetId: 'ruleset-1', order: 0 }, deps);
    expect(binding).toEqual({ id: 'rule-1' });

    deps.http.request.mockRejectedValue(new HttpError('conflict', 409, 'Conflict', null, { method: 'POST', url: 'x' }));
    fetchFirewallRulesApiMock.mockResolvedValue([{ id: 'rule-existing', behaviors: [{ name: 'waf', target: 'ruleset-1' }] }]);
    buildFirewallRuleBindingMock.mockReturnValue({ id: 'rule-existing' });
    persistFirewallRuleMock.mockResolvedValue({ id: 'rule-existing' });

    const reused = await applyWafRulesetViaApi({ firewallId: 'fw-1', rulesetId: 'ruleset-1', order: 0 }, deps);
    expect(reused).toEqual({ id: 'rule-existing' });
  });
});
