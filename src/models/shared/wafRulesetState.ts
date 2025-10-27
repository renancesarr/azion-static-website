import type { WafRulesetRecordData } from './wafRulesetRecordData.js';

export interface WafRulesetState {
  rulesets: Record<string, WafRulesetRecordData>;
}
