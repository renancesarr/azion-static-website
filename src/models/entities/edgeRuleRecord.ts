import type { EdgeRuleRecordData } from '../shared/edgeRuleRecordData.js';
import type { AzionRule } from '../dto/azionRule.js';

export class EdgeRuleRecord implements EdgeRuleRecordData {
  readonly id: string;
  readonly edgeApplicationId: string;
  readonly phase: string;
  readonly order: number;
  readonly createdAt: string;
  readonly raw: unknown;

  private constructor(data: EdgeRuleRecordData) {
    this.id = data.id;
    this.edgeApplicationId = data.edgeApplicationId;
    this.phase = data.phase;
    this.order = data.order;
    this.createdAt = data.createdAt;
    this.raw = data.raw;
  }

  static fromAzionPayload(payload: AzionRule, edgeApplicationId: string): EdgeRuleRecord {
    return new EdgeRuleRecord({
      id: payload.id,
      edgeApplicationId,
      phase: payload.phase,
      order: payload.order,
      createdAt: payload.created_at ?? new Date().toISOString(),
      raw: payload,
    });
  }

  static hydrate(data: EdgeRuleRecordData): EdgeRuleRecord {
    return new EdgeRuleRecord(data);
  }

  toJSON(): EdgeRuleRecordData {
    return {
      id: this.id,
      edgeApplicationId: this.edgeApplicationId,
      phase: this.phase,
      order: this.order,
      createdAt: this.createdAt,
      raw: this.raw,
    };
  }
}

