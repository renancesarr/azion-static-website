import type { FirewallRecordData } from '../shared/firewallRecordData.js';

function cloneDomainIds(ids: string[]): string[] {
  return [...ids];
}

export class FirewallRecord implements FirewallRecordData {
  readonly id: string;
  readonly name: string;
  readonly domainIds: string[];
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly raw: unknown;

  private constructor(data: FirewallRecordData) {
    this.id = data.id;
    this.name = data.name;
    this.domainIds = cloneDomainIds(data.domainIds ?? []);
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.raw = data.raw;
  }

  static create(data: FirewallRecordData): FirewallRecord {
    return new FirewallRecord({
      ...data,
      domainIds: cloneDomainIds(data.domainIds ?? []),
    });
  }

  static hydrate(data: FirewallRecordData): FirewallRecord {
    return FirewallRecord.create(data);
  }

  toJSON(): FirewallRecordData {
    return {
      id: this.id,
      name: this.name,
      domainIds: cloneDomainIds(this.domainIds),
      isActive: this.isActive,
      createdAt: this.createdAt,
      raw: this.raw,
    };
  }
}
