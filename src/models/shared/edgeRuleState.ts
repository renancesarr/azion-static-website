import type { EdgeRuleRecordData } from './edgeRuleRecordData.js';

export interface EdgeRuleState {
  rules: Record<string, EdgeRuleRecordData>;
}
