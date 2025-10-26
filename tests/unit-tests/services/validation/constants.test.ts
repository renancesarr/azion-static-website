import { STACK_STATE, UPLOAD_LOG_DIR } from '../../../../src/services/validation/constants.js';

describe('validation constants', () => {
  it('define caminhos de estado e diretório de logs', () => {
    expect(STACK_STATE.bucket).toBe('storage/storage_buckets.json');
    expect(STACK_STATE.edgeApp).toBe('edge/edge_applications.json');
    expect(STACK_STATE.connector).toBe('edge/edge_connectors.json');
    expect(STACK_STATE.cacheRule).toBe('edge/rules_engine.json');
    expect(STACK_STATE.domain).toBe('edge/domains.json');
    expect(STACK_STATE.firewall).toBe('security/firewalls.json');
    expect(STACK_STATE.wafRuleset).toBe('security/waf_rulesets.json');
    expect(STACK_STATE.firewallRule).toBe('security/firewall_rules.json');
    expect(UPLOAD_LOG_DIR).toBe('.mcp-state/storage/uploads/logs');
  });
});
