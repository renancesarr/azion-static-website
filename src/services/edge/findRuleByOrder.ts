import { readStateFile } from '../../utils/state.js';
import { EdgeRuleRecord } from '../../models/edgeRuleRecord.js';
import { EdgeRuleState } from '../../models/edgeRuleState.js';
import { EDGE_RULE_STATE_FILE } from './constants.js';
import { normalizeRuleState } from './normalizeRuleState.js';

export async function findRuleByOrder(
  edgeApplicationId: string,
  phase: string,
  order: number,
): Promise<EdgeRuleRecord | undefined> {
  const current = normalizeRuleState(await readStateFile<EdgeRuleState>(EDGE_RULE_STATE_FILE));
  return Object.values(current.rules).find((rule) => rule.edgeApplicationId === edgeApplicationId && rule.phase === phase && rule.order === order);
}
