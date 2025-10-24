import { readStateFile } from '../../utils/state.js';
import { ValidationCheckResult } from '../../models/validationCheckResult.js';

export async function readState<T>(relativePath: string): Promise<T | undefined> {
  return await readStateFile<T>(relativePath);
}

export function summarizeState(name: string, ok: boolean, detail: string): ValidationCheckResult {
  return {
    name,
    ok,
    detail,
  };
}

export function listIds<T extends { id: string }>(collection: Record<string, T> | undefined): string {
  if (!collection) {
    return 'n/d';
  }
  const ids = Object.values(collection).map((item) => item.id);
  return ids.length > 0 ? ids.join(', ') : 'n/d';
}
