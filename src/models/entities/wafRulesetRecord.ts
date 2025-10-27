import type { WafRulesetRecordData } from '../shared/wafRulesetRecordData.js';

export class WafRulesetRecord implements WafRulesetRecordData {
  readonly id: string;
  readonly name: string;
  readonly mode: string;
  readonly createdAt: string;
  readonly raw: unknown;

  private constructor(data: WafRulesetRecordData) {
    this.id = data.id;
    this.name = data.name;
    this.mode = data.mode;
    this.createdAt = data.createdAt;
    this.raw = data.raw;
  }

  static create(data: WafRulesetRecordData): WafRulesetRecord {
    return new WafRulesetRecord(data);
  }

  static hydrate(data: WafRulesetRecordData): WafRulesetRecord {
    return WafRulesetRecord.create(data);
  }

  toJSON(): WafRulesetRecordData {
    return {
      id: this.id,
      name: this.name,
      mode: this.mode,
      createdAt: this.createdAt,
      raw: this.raw,
    };
  }
}
