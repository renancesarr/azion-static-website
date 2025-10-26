import type { AzionDomain } from '../../models/dto/azionDomain.js';
import type { AzionDomainListResponse } from '../../models/dto/azionDomainListResponse.js';
import type { DomainDependencies } from './types.js';
import { defaultDomainDependencies } from './dependencies.js';

export async function findDomainByNameApi(
  name: string,
  deps: DomainDependencies = defaultDomainDependencies,
): Promise<AzionDomain | undefined> {
  const response = await deps.http<AzionDomainListResponse>({
    method: 'GET',
    url: `${deps.apiBase}/v4/domains?name=${encodeURIComponent(name)}`,
  });
  return response.data.results?.find((domain: AzionDomain) => domain.name === name);
}
