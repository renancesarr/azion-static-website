import type { WafPolicyRecordData } from '../shared/wafPolicyRecordData.js';

export class WafPolicyRecord implements WafPolicyRecordData {
  readonly edgeApplicationId: string;
  readonly wafId: string;
  readonly mode: string;
  readonly enabled: boolean;
  readonly updatedAt: string;
  readonly raw: unknown;

  private constructor(data: WafPolicyRecordData) {
    this.edgeApplicationId = data.edgeApplicationId;
    this.wafId = data.wafId;
    this.mode = data.mode;
    this.enabled = data.enabled;
    this.updatedAt = data.updatedAt;
    this.raw = data.raw;
  }

  static create(data: WafPolicyRecordData): WafPolicyRecord {
    return new WafPolicyRecord(data);
  }

  static hydrate(data: WafPolicyRecordData): WafPolicyRecord {
    return WafPolicyRecord.create(data);
  }

  toJSON(): WafPolicyRecordData {
    return {
      edgeApplicationId: this.edgeApplicationId,
      wafId: this.wafId,
      mode: this.mode,
      enabled: this.enabled,
      updatedAt: this.updatedAt,
      raw: this.raw,
    };
  }
}
