import type { EdgeAppState } from '../../models/shared/edgeAppState.js';

export function normalizeEdgeApplicationState(state?: EdgeAppState): EdgeAppState {
  if (!state) {
    return { applications: {} };
  }
  return { applications: state.applications ?? {} };
}
