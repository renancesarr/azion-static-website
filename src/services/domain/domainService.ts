import type { EnsureResult } from '../../utils/ensure.js';
import { DomainRecord } from '../../models/entities/domainRecord.js';
import { buildDnsInstruction } from './buildDnsInstruction.js';
import type { CreateDomainInput } from './schemas.js';
import type { DomainDependencies } from './types.js';
import { defaultDomainDependencies } from './dependencies.js';
import { createDomainCacheRepository } from './repositories/domainCacheRepository.js';
import { createDomainApiRepository } from './repositories/domainApiRepository.js';

export interface DomainServiceOptions {
  dependencies?: DomainDependencies;
}

export interface DnsInstructionsResult {
  record: DomainRecord;
  instructions: string[];
  source: 'cache' | 'api';
  stateSynced: boolean;
}

export function createDomainService(options: DomainServiceOptions = {}) {
  const deps = options.dependencies ?? defaultDomainDependencies;
  const cacheRepository = createDomainCacheRepository();
  const apiRepository = createDomainApiRepository(deps);

  async function getCachedDomain(name: string): Promise<DomainRecord | undefined> {
    return cacheRepository.getByName(name);
  }

  async function fetchAndPersistDomain(name: string): Promise<DomainRecord | undefined> {
    const payload = await apiRepository.findByName(name);
    if (!payload) {
      return undefined;
    }
    const hydrated = DomainRecord.fromAzionPayload(payload);
    await cacheRepository.save(hydrated);
    return hydrated;
  }

  async function createDomain(input: CreateDomainInput): Promise<DomainRecord> {
    try {
      const payload = await apiRepository.create(input);
      const record = DomainRecord.fromAzionPayload(payload);
      await cacheRepository.save(record);
      return record;
    } catch (error) {
      if ('status' in (error as Error) && (error as { status: number }).status === 409) {
        const existing = await fetchAndPersistDomain(input.name);
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  async function ensureDomain(input: CreateDomainInput): Promise<EnsureResult<DomainRecord>> {
    const cached = await getCachedDomain(input.name);
    if (cached) {
      return { record: cached, created: false };
    }
    const created = await createDomain(input);
    return { record: created, created: true };
  }

  async function getDnsInstructions(domainName: string): Promise<DnsInstructionsResult> {
    const cached = await getCachedDomain(domainName);
    if (!cached) {
      const synced = await fetchAndPersistDomain(domainName);
      if (!synced) {
        throw new Error(`Domain ${domainName} não encontrado (cache ou API).`);
      }
      return {
        record: synced,
        instructions: buildDnsInstruction(synced.toAzionPayload()),
        source: 'api',
        stateSynced: true,
      };
    }

    const refreshed = await fetchAndPersistDomain(domainName);
    if (refreshed) {
      return {
        record: refreshed,
        instructions: buildDnsInstruction(refreshed.toAzionPayload()),
        source: 'api',
        stateSynced: false,
      };
    }

    return {
      record: cached,
      instructions: buildDnsInstruction(cached.toAzionPayload()),
      source: 'cache',
      stateSynced: false,
    };
  }

  return {
    getCachedDomain,
    fetchAndPersistDomain,
    createDomain,
    ensureDomain,
    getDnsInstructions,
  };
}
