export const STACK_STATE = {
  bucket: 'storage/storage_buckets.json',
  edgeApp: 'edge/edge_applications.json',
  connector: 'edge/edge_connectors.json',
  cacheRule: 'edge/rules_engine.json',
  domain: 'edge/domains.json',
  firewall: 'security/firewalls.json',
  wafRuleset: 'security/waf_rulesets.json',
  firewallRule: 'security/firewall_rules.json',
} as const;

export const UPLOAD_LOG_DIR = '.mcp-state/storage/uploads/logs';
