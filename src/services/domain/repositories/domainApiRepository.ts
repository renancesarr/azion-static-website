import type { AzionDomain } from '../../../models/dto/azionDomain.js';
import type { AzionDomainResponse } from '../../../models/dto/azionDomainResponse.js';
import type { AzionDomainListResponse } from '../../../models/dto/azionDomainListResponse.js';
import type { CreateDomainInput } from '../schemas.js';
import type { DomainDependencies } from '../types.js';
import { defaultDomainDependencies } from '../dependencies.js';

export interface DomainApiRepository {
  create(input: CreateDomainInput): Promise<AzionDomain>;
  findByName(name: string): Promise<AzionDomain | undefined>;
}

export function createDomainApiRepository(
  deps: DomainDependencies = defaultDomainDependencies,
): DomainApiRepository {
  return {
    async create(input: CreateDomainInput): Promise<AzionDomain> {
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
      return response.data.results ?? response.data.data ?? (response.data as unknown as AzionDomain);
    },

    async findByName(name: string): Promise<AzionDomain | undefined> {
      const response = await deps.http<AzionDomainListResponse>({
        method: 'GET',
        url: `${deps.apiBase}/v4/domains?name=${encodeURIComponent(name)}`,
      });
      return response.data.results?.find((domain: AzionDomain) => domain.name === name);
    },
  };
}
