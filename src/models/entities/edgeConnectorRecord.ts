import type { EdgeConnectorRecordData } from '../shared/edgeConnectorRecordData.js';
import type { AzionConnector } from '../dto/azionConnector.js';

export class EdgeConnectorRecord implements EdgeConnectorRecordData {
  readonly id: string;
  readonly name: string;
  readonly bucketId: string;
  readonly bucketName?: string;
  readonly originPath?: string;
  readonly createdAt: string;
  readonly raw: unknown;

  private constructor(data: EdgeConnectorRecordData) {
    this.id = data.id;
    this.name = data.name;
    this.bucketId = data.bucketId;
    this.bucketName = data.bucketName;
    this.originPath = data.originPath;
    this.createdAt = data.createdAt;
    this.raw = data.raw;
  }

  static fromAzionPayload(payload: AzionConnector, bucketId: string, bucketName?: string): EdgeConnectorRecord {
    return new EdgeConnectorRecord({
      id: payload.id,
      name: payload.name,
      bucketId,
      bucketName: bucketName ?? payload.bucket?.name,
      originPath: payload.origin_path,
      createdAt: payload.created_at ?? new Date().toISOString(),
      raw: payload,
    });
  }

  static hydrate(data: EdgeConnectorRecordData): EdgeConnectorRecord {
    return new EdgeConnectorRecord(data);
  }

  toJSON(): EdgeConnectorRecordData {
    return {
      id: this.id,
      name: this.name,
      bucketId: this.bucketId,
      bucketName: this.bucketName,
      originPath: this.originPath,
      createdAt: this.createdAt,
      raw: this.raw,
    };
  }
}

