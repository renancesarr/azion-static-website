import type { FirewallRuleBindingData } from '../shared/firewallRuleBindingData.js';

export class FirewallRuleBinding implements FirewallRuleBindingData {
  readonly id: string;
  readonly firewallId: string;
  readonly rulesetId: string;
  readonly order: number;
  readonly createdAt: string;
  readonly raw: unknown;

  private constructor(data: FirewallRuleBindingData) {
    this.id = data.id;
    this.firewallId = data.firewallId;
    this.rulesetId = data.rulesetId;
    this.order = data.order;
    this.createdAt = data.createdAt;
    this.raw = data.raw;
  }

  static create(data: FirewallRuleBindingData): FirewallRuleBinding {
    return new FirewallRuleBinding(data);
  }

  static hydrate(data: FirewallRuleBindingData): FirewallRuleBinding {
    return FirewallRuleBinding.create(data);
  }

  toJSON(): FirewallRuleBindingData {
    return {
      id: this.id,
      firewallId: this.firewallId,
      rulesetId: this.rulesetId,
      order: this.order,
      createdAt: this.createdAt,
      raw: this.raw,
    };
  }
}
