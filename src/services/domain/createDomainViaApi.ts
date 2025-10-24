import { AzionDomain } from '../../models/azionDomain.js';
import { AzionDomainResponse } from '../../models/azionDomainResponse.js';
import { CreateDomainInput } from './schemas.js';
import { buildDomainRecord } from './buildDomainRecord.js';
import { persistDomain } from './persistDomain.js';
import { findDomainByNameApi } from './findDomainByNameApi.js';
import { defaultDomainDependencies } from './dependencies.js';
import type { DomainDependencies } from './types.js';

export async function createDomainViaApi(
  input: CreateDomainInput,
  deps: DomainDependencies = defaultDomainDependencies,
): Promise<ReturnType<typeof persistDomain>> {
  try {
    const response = await deps.http<AzionDomainResponse>({
      method: 'POST',
      url: `${deps.apiBase}/v4/domains`,
      body: {
        name: input.name,
        edge_application_id: input.edgeApplicationId,
        is_active: input.isActive,
        cname: input.cname,
      },
    });
    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionDomain);
    return await persistDomain(buildDomainRecord(payload));
  } catch (error) {
    if ('status' in (error as Error) && (error as { status: number }).status === 409) {
      const existing = await findDomainByNameApi(input.name, deps);
      if (existing) {
        return await persistDomain(buildDomainRecord(existing));
      }
    }
    throw error;
  }
}
