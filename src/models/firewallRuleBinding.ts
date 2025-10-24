export interface FirewallRuleBinding {
  id: string;
  firewallId: string;
  rulesetId: string;
  order: number;
  createdAt: string;
  raw: unknown;
}
