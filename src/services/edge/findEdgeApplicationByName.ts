import { EDGE_APP_STATE_FILE } from './constants.js';
import { EdgeAppState } from '../../models/edgeAppState.js';
import { EdgeApplicationRecord } from '../../models/edgeApplicationRecord.js';
import { normalizeEdgeApplicationState } from './normalizeEdgeApplicationState.js';
import { StateRepository } from '../../core/state/StateRepository.js';

export async function findEdgeApplicationByName(
  state: StateRepository,
  name: string,
): Promise<EdgeApplicationRecord | undefined> {
  const current = normalizeEdgeApplicationState(await state.read<EdgeAppState>(EDGE_APP_STATE_FILE));
  return current.applications[name];
}
