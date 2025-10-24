import { EdgeRuleRecord } from './edgeRuleRecord.js';

export interface EdgeRuleState {
  rules: Record<string, EdgeRuleRecord>;
}
