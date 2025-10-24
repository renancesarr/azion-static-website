import { summarizeState, readState } from './stateUtils.js';
import { STACK_STATE } from './constants.js';
import { type DomainConflictInput } from './schemas.js';

export async function checkDomainConflict(input: DomainConflictInput) {
  const state = await readState<{ domains: Record<string, { id: string }> }>(STACK_STATE.domain);
  const match = state?.domains?.[input.domainName];
  return summarizeState(
    'Domain existente',
    !!match,
    match ? `Domínio presente (id=${match.id}). Reexecuções evitarão 409.` : 'Domínio não encontrado em cache local.',
  );
}
