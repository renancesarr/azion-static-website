import { ValidationCheckResult } from '../../models/validationCheckResult.js';
import { summarizeState } from './stateUtils.js';
import { UPLOAD_LOG_DIR } from './constants.js';
import type { ValidationDependencies } from './types.js';
import { defaultValidationDependencies } from './dependencies.js';

export async function inspectUploadLogs(
  limit: number,
  deps: ValidationDependencies = defaultValidationDependencies,
): Promise<ValidationCheckResult[]> {
  try {
    const entries = await deps.readDir(UPLOAD_LOG_DIR);
    const latest = entries
      .filter((name) => name.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);

    if (latest.length === 0) {
      return [summarizeState('Upload logs', false, 'Nenhum arquivo em storage/uploads/logs/.')];
    }

    const results: ValidationCheckResult[] = [];
    for (const name of latest) {
      const content = JSON.parse(await deps.readFile(`${UPLOAD_LOG_DIR}/${name}`, 'utf-8'));
      const totals = content?.totals ?? {};
      results.push({
        name,
        ok: (totals.failed ?? 0) === 0,
        detail: `enviados=${totals.uploaded ?? 'n/d'}, pulados=${totals.skipped ?? 'n/d'}, falhas=${totals.failed ?? 'n/d'}`,
      });
    }

    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [summarizeState('Upload logs', false, `Erro ao ler logs: ${message}`)];
  }
}
