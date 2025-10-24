import { EdgeAppState } from '../../models/edgeAppState.js';

export function normalizeEdgeApplicationState(state?: EdgeAppState): EdgeAppState {
  if (!state) {
    return { applications: {} };
  }
  return { applications: state.applications ?? {} };
}
