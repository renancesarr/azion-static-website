import type { DomainRecordData } from '../shared/domainRecordData.js';
import type { AzionDomain } from '../dto/azionDomain.js';

export class DomainRecord implements DomainRecordData {
  readonly id: string;
  readonly name: string;
  readonly edgeApplicationId: string;
  readonly isActive: boolean;
  readonly cname: string;
  readonly createdAt: string;
  readonly raw: unknown;

  private constructor(data: DomainRecordData) {
    this.id = data.id;
    this.name = data.name;
    this.edgeApplicationId = data.edgeApplicationId;
    this.isActive = data.isActive;
    this.cname = data.cname;
    this.createdAt = data.createdAt;
    this.raw = data.raw;
  }

  static fromAzionPayload(payload: AzionDomain): DomainRecord {
    return new DomainRecord({
      id: payload.id,
      name: payload.name,
      edgeApplicationId: payload.edge_application_id,
      isActive: payload.active,
      cname: payload.cname,
      createdAt: payload.created_at ?? new Date().toISOString(),
      raw: payload,
    });
  }

  static hydrate(data: DomainRecordData): DomainRecord {
    return new DomainRecord(data);
  }

  toJSON(): DomainRecordData {
    return {
      id: this.id,
      name: this.name,
      edgeApplicationId: this.edgeApplicationId,
      isActive: this.isActive,
      cname: this.cname,
      createdAt: this.createdAt,
      raw: this.raw,
    };
  }
}

