import { EdgeRuleRecord } from '../../models/edgeRuleRecord.js';
import { EdgeRuleState } from '../../models/edgeRuleState.js';
import { EDGE_RULE_STATE_FILE } from './constants.js';
import { normalizeRuleState } from './normalizeRuleState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function persistRule(state: StateRepository, record: EdgeRuleRecord): Promise<EdgeRuleRecord> {
  const current = normalizeRuleState(await state.read<EdgeRuleState>(EDGE_RULE_STATE_FILE));
  current.rules[record.id] = record;
  await state.write(EDGE_RULE_STATE_FILE, current);
  return record;
}
