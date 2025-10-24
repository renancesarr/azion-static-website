import { ValidationCheckResult } from '../../models/validationCheckResult.js';
import { loadFirstUploadIndex } from './loadFirstUploadIndex.js';
import { summarizeState } from './stateUtils.js';

export async function validateUploadIdempotency(): Promise<ValidationCheckResult[]> {
  const uploadIndex = await loadFirstUploadIndex();
  if (!uploadIndex) {
    return [summarizeState('Upload index', false, 'Nenhum índice encontrado para avaliar idempotência.')];
  }

  const seenObjects = new Set<string>();
  const duplicateObjects: string[] = [];
  for (const entry of Object.values(uploadIndex.file.files ?? {})) {
    if (seenObjects.has(entry.objectPath)) {
      duplicateObjects.push(entry.objectPath);
    } else {
      seenObjects.add(entry.objectPath);
    }
  }

  const checks: ValidationCheckResult[] = [
    summarizeState(
      'Objetos únicos',
      duplicateObjects.length === 0,
      duplicateObjects.length === 0 ? 'Sem duplicatas.' : `Duplicados: ${duplicateObjects.join(', ')}`,
    ),
  ];

  const missingHash = Object.values(uploadIndex.file.files ?? {}).filter((entry) => !entry.hash);
  checks.push(
    summarizeState(
      'Hash por objeto',
      missingHash.length === 0,
      missingHash.length === 0 ? 'Todos possuem hash.' : `Sem hash: ${missingHash.map((e) => e.objectPath).join(', ')}`,
    ),
  );

  return checks;
}
