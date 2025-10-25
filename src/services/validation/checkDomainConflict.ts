import { summarizeState, readState } from './stateUtils.js';
import { STACK_STATE } from './constants.js';
import { type DomainConflictInput } from './schemas.js';
import type { ValidationDependencies } from './types.js';

export async function checkDomainConflict(
  input: DomainConflictInput,
  deps: ValidationDependencies,
) {
  const state = await readState<{ domains: Record<string, { id: string }> }>(deps.state, STACK_STATE.domain);
  const match = state?.domains?.[input.domainName];
  return summarizeState(
    'Domain existente',
    !!match,
    match ? `Domínio presente (id=${match.id}). Reexecuções evitarão 409.` : 'Domínio não encontrado em cache local.',
  );
}
