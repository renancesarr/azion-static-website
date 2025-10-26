import { EdgeRuleRecord } from '../../models/entities/edgeRuleRecord.js';
import type { EdgeRuleState } from '../../models/shared/edgeRuleState.js';
import { EDGE_RULE_STATE_FILE } from './constants.js';
import { normalizeRuleState } from './normalizeRuleState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function persistRule(state: StateRepository, record: EdgeRuleRecord): Promise<EdgeRuleRecord> {
  const current = normalizeRuleState(await state.read<EdgeRuleState>(EDGE_RULE_STATE_FILE));
  current.rules[record.id] = record.toJSON();
  await state.write(EDGE_RULE_STATE_FILE, current);
  return record;
}
