import { readStateFile } from '../../utils/state.js';
import type { DomainState } from '../../models/dto/domainState.js';
import { CreateFirewallInput } from './schemas.js';

export async function resolveDomainIds(input: CreateFirewallInput): Promise<string[]> {
  const ids = new Set<string>(input.domainIds ?? []);

  if (input.domainNames && input.domainNames.length > 0) {
    const domainState = (await readStateFile<DomainState>('edge/domains.json')) ?? { domains: {} };
    for (const name of input.domainNames) {
      const entry = domainState.domains[name];
      if (!entry) {
        throw new Error(`Domain ${name} não encontrado em cache local. Execute azion.create_domain antes.`);
      }
      ids.add(entry.id);
    }
  }

  if (ids.size === 0) {
    throw new Error('Nenhum domínio válido encontrado para o firewall.');
  }

  return Array.from(ids);
}
