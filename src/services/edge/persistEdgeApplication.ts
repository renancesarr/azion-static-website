import { EdgeApplicationRecord } from '../../models/entities/edgeApplicationRecord.js';
import type { EdgeAppState } from '../../models/shared/edgeAppState.js';
import { EDGE_APP_STATE_FILE } from './constants.js';
import { normalizeEdgeApplicationState } from './normalizeEdgeApplicationState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function persistEdgeApplication(
  state: StateRepository,
  record: EdgeApplicationRecord,
): Promise<EdgeApplicationRecord> {
  const current = normalizeEdgeApplicationState(await state.read<EdgeAppState>(EDGE_APP_STATE_FILE));
  current.applications[record.name] = record.toJSON();
  await state.write(EDGE_APP_STATE_FILE, current);
  return record;
}
