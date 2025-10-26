import type { EdgeApplicationRecordData } from '../shared/edgeApplicationRecordData.js';
import type { AzionEdgeApplication } from '../dto/azionEdgeApplication.js';

export class EdgeApplicationRecord implements EdgeApplicationRecordData {
  readonly id: string;
  readonly name: string;
  readonly deliveryProtocol: string;
  readonly originProtocol: string;
  readonly caching: Record<string, unknown>;
  readonly enableWaf: boolean;
  readonly createdAt: string;
  readonly raw: unknown;

  private constructor(data: EdgeApplicationRecordData) {
    this.id = data.id;
    this.name = data.name;
    this.deliveryProtocol = data.deliveryProtocol;
    this.originProtocol = data.originProtocol;
    this.caching = data.caching;
    this.enableWaf = data.enableWaf;
    this.createdAt = data.createdAt;
    this.raw = data.raw;
  }

  static fromAzionPayload(payload: AzionEdgeApplication): EdgeApplicationRecord {
    return new EdgeApplicationRecord({
      id: payload.id,
      name: payload.name,
      deliveryProtocol: payload.delivery_protocol,
      originProtocol: payload.origin_protocol_policy,
      caching: payload.caching ?? {},
      enableWaf: payload.waf?.active ?? false,
      createdAt: payload.created_at ?? new Date().toISOString(),
      raw: payload,
    });
  }

  static hydrate(data: EdgeApplicationRecordData): EdgeApplicationRecord {
    return new EdgeApplicationRecord({
      ...data,
      caching: data.caching ?? {},
    });
  }

  toJSON(): EdgeApplicationRecordData {
    return {
      id: this.id,
      name: this.name,
      deliveryProtocol: this.deliveryProtocol,
      originProtocol: this.originProtocol,
      caching: this.caching,
      enableWaf: this.enableWaf,
      createdAt: this.createdAt,
      raw: this.raw,
    };
  }
}

