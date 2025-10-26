import { EdgeRuleRecord } from '../../models/entities/edgeRuleRecord.js';
import type { EdgeRuleState } from '../../models/shared/edgeRuleState.js';
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
  const match = Object.values(current.rules).find(
    (rule) => rule.edgeApplicationId === edgeApplicationId && rule.phase === phase && rule.order === order,
  );
  if (!match) {
    return undefined;
  }
  return EdgeRuleRecord.hydrate(match);
}
