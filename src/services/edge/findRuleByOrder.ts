import { EdgeRuleRecord } from '../../models/edgeRuleRecord.js';
import { EdgeRuleState } from '../../models/edgeRuleState.js';
import { EDGE_RULE_STATE_FILE } from './constants.js';
import { normalizeRuleState } from './normalizeRuleState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function findRuleByOrder(
  state: StateRepository,
  edgeApplicationId: string,
  phase: string,
  order: number,
): Promise<EdgeRuleRecord | undefined> {
  const current = normalizeRuleState(await state.read<EdgeRuleState>(EDGE_RULE_STATE_FILE));
  return Object.values(current.rules).find((rule) => rule.edgeApplicationId === edgeApplicationId && rule.phase === phase && rule.order === order);
}
