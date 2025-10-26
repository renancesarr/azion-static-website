import type { DomainState } from '../../models/shared/domainState.js';

export function normalizeDomainState(state?: DomainState): DomainState {
  if (!state) {
    return { domains: {} };
  }
  return { domains: state.domains ?? {} };
}
