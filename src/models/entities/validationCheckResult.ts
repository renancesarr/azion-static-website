import type { ValidationCheckResultData } from '../shared/validationCheckResultData.js';

export class ValidationCheckResult implements ValidationCheckResultData {
  readonly name: string;
  readonly ok: boolean;
  readonly detail: string;

  private constructor(data: ValidationCheckResultData) {
    this.name = data.name;
    this.ok = data.ok;
    this.detail = data.detail;
  }

  static create(data: ValidationCheckResultData): ValidationCheckResult {
    return new ValidationCheckResult(data);
  }

  static hydrate(data: ValidationCheckResultData): ValidationCheckResult {
    return ValidationCheckResult.create(data);
  }

  withDetail(detail: string): ValidationCheckResult {
    return ValidationCheckResult.create({ ...this.toJSON(), detail });
  }

  toJSON(): ValidationCheckResultData {
    return {
      name: this.name,
      ok: this.ok,
      detail: this.detail,
    };
  }
}
