import type { StorageBucketRecordData } from '../shared/storageBucketRecordData.js';

function cloneOptional(value?: string): string | undefined {
  return value ?? undefined;
}

export class StorageBucketRecord implements StorageBucketRecordData {
  readonly id: string;
  readonly name: string;
  readonly edgeAccess?: string;
  readonly description?: string;
  readonly region?: string;
  readonly createdAt: string;
  readonly raw: unknown;

  private constructor(data: StorageBucketRecordData) {
    this.id = data.id;
    this.name = data.name;
    this.edgeAccess = cloneOptional(data.edgeAccess);
    this.description = cloneOptional(data.description);
    this.region = cloneOptional(data.region);
    this.createdAt = data.createdAt;
    this.raw = data.raw;
  }

  static create(data: StorageBucketRecordData): StorageBucketRecord {
    return new StorageBucketRecord({
      ...data,
      edgeAccess: cloneOptional(data.edgeAccess),
      description: cloneOptional(data.description),
      region: cloneOptional(data.region),
    });
  }

  static hydrate(data: StorageBucketRecordData): StorageBucketRecord {
    return StorageBucketRecord.create(data);
  }

  toJSON(): StorageBucketRecordData {
    return {
      id: this.id,
      name: this.name,
      edgeAccess: cloneOptional(this.edgeAccess),
      description: cloneOptional(this.description),
      region: cloneOptional(this.region),
      createdAt: this.createdAt,
      raw: this.raw,
    };
  }

  withCreatedAt(createdAt: string): StorageBucketRecord {
    return StorageBucketRecord.create({
      ...this.toJSON(),
      createdAt,
    });
  }

  merge(partial: Partial<StorageBucketRecordData>): StorageBucketRecord {
    return StorageBucketRecord.create({
      ...this.toJSON(),
      ...partial,
      edgeAccess: partial.edgeAccess ?? this.edgeAccess,
      description: partial.description ?? this.description,
      region: partial.region ?? this.region,
      createdAt: partial.createdAt ?? this.createdAt,
    });
  }
}
