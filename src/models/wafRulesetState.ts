import { WafRulesetRecord } from './wafRulesetRecord.js';

export interface WafRulesetState {
  rulesets: Record<string, WafRulesetRecord>;
}
