import { jest } from '@jest/globals';

const findFirewallByNameMock = jest.fn();
const createFirewallViaApiMock = jest.fn();
const findWafMock = jest.fn();
const configureWafViaApiMock = jest.fn();
const findWafRulesetByNameMock = jest.fn();
const createWafRulesetViaApiMock = jest.fn();
const findFirewallRuleBindingFromStateMock = jest.fn();
const applyWafRulesetViaApiMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/security/findFirewallByName.js', () => ({
  findFirewallByName: findFirewallByNameMock,
}));

jest.unstable_mockModule('../../../../src/services/security/createFirewallViaApi.js', () => ({
  createFirewallViaApi: createFirewallViaApiMock,
}));

jest.unstable_mockModule('../../../../src/services/security/findWaf.js', () => ({
  findWaf: findWafMock,
}));

jest.unstable_mockModule('../../../../src/services/security/configureWafViaApi.js', () => ({
  configureWafViaApi: configureWafViaApiMock,
}));

jest.unstable_mockModule('../../../../src/services/security/findWafRulesetByName.js', () => ({
  findWafRulesetByName: findWafRulesetByNameMock,
}));

jest.unstable_mockModule('../../../../src/services/security/createWafRulesetViaApi.js', () => ({
  createWafRulesetViaApi: createWafRulesetViaApiMock,
}));

jest.unstable_mockModule('../../../../src/services/security/persistFirewallRule.js', () => ({
  findFirewallRuleBindingFromState: findFirewallRuleBindingFromStateMock,
  persistFirewallRule: jest.fn(),
}));

jest.unstable_mockModule('../../../../src/services/security/applyWafRulesetViaApi.js', () => ({
  applyWafRulesetViaApi: applyWafRulesetViaApiMock,
}));

let ensureFirewall: typeof import('../../../../src/services/security/ensureFirewall.js')['ensureFirewall'];
let ensureWaf: typeof import('../../../../src/services/security/ensureWaf.js')['ensureWaf'];
let ensureWafRuleset: typeof import('../../../../src/services/security/ensureWafRuleset.js')['ensureWafRuleset'];
let ensureFirewallRule: typeof import('../../../../src/services/security/ensureFirewallRule.js')['ensureFirewallRule'];

beforeAll(async () => {
  ({ ensureFirewall } = await import('../../../../src/services/security/ensureFirewall.js'));
  ({ ensureWaf } = await import('../../../../src/services/security/ensureWaf.js'));
  ({ ensureWafRuleset } = await import('../../../../src/services/security/ensureWafRuleset.js'));
  ({ ensureFirewallRule } = await import('../../../../src/services/security/ensureFirewallRule.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('security ensure helpers', () => {
  const deps = { state: {} } as any;

  it('reutiliza firewall cacheado', async () => {
    findFirewallByNameMock.mockResolvedValue({ id: 'fw-1' });
    const result = await ensureFirewall({ name: 'firewall' } as any, deps);
    expect(result).toEqual({ record: { id: 'fw-1' }, created: false });
    expect(createFirewallViaApiMock).not.toHaveBeenCalled();
  });

  it('cria firewall quando ausente', async () => {
    findFirewallByNameMock.mockResolvedValue(undefined);
    createFirewallViaApiMock.mockResolvedValue({ id: 'fw-2' });
    const result = await ensureFirewall({ name: 'firewall' } as any, deps);
    expect(result).toEqual({ record: { id: 'fw-2' }, created: true });
  });

  it('reutiliza WAF cacheado', async () => {
    findWafMock.mockResolvedValue({ wafId: 'waf-1' });
    const result = await ensureWaf({ edgeApplicationId: 'edge-1' } as any, deps);
    expect(result).toEqual({ record: { wafId: 'waf-1' }, created: false });
  });

  it('cria WAF quando ausente', async () => {
    findWafMock.mockResolvedValue(undefined);
    configureWafViaApiMock.mockResolvedValue({ wafId: 'waf-2' });
    const result = await ensureWaf({ edgeApplicationId: 'edge-1' } as any, deps);
    expect(result).toEqual({ record: { wafId: 'waf-2' }, created: true });
  });

  it('reutiliza ruleset cacheado', async () => {
    findWafRulesetByNameMock.mockResolvedValue({ id: 'ruleset-1' });
    const result = await ensureWafRuleset({ name: 'default' } as any, deps);
    expect(result).toEqual({ record: { id: 'ruleset-1' }, created: false });
  });

  it('cria ruleset quando ausente', async () => {
    findWafRulesetByNameMock.mockResolvedValue(undefined);
    createWafRulesetViaApiMock.mockResolvedValue({ id: 'ruleset-2' });
    const result = await ensureWafRuleset({ name: 'default' } as any, deps);
    expect(result).toEqual({ record: { id: 'ruleset-2' }, created: true });
  });

  it('reutiliza binding existente', async () => {
    findFirewallRuleBindingFromStateMock.mockResolvedValue({ id: 'binding-1' });
    const result = await ensureFirewallRule({ firewallId: 'fw-1', rulesetId: 'ruleset-1', order: 0 } as any, deps);
    expect(result).toEqual({ record: { id: 'binding-1' }, created: false });
  });

  it('cria binding quando ausente', async () => {
    findFirewallRuleBindingFromStateMock.mockResolvedValue(undefined);
    applyWafRulesetViaApiMock.mockResolvedValue({ id: 'binding-2' });
    const result = await ensureFirewallRule({ firewallId: 'fw-1', rulesetId: 'ruleset-1', order: 0 } as any, deps);
    expect(result).toEqual({ record: { id: 'binding-2' }, created: true });
  });
});
