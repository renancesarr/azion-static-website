import { extname } from 'node:path';
import { ValidationCheckResult } from '../../models/entities/validationCheckResult.js';
import { lookupMimeType } from '../../utils/mime.js';
import { loadFirstUploadIndex } from './loadFirstUploadIndex.js';
import type { ValidationDependencies } from './types.js';

export interface MimetypeValidationResult {
  matches: number;
  mismatches: ValidationCheckResult[];
}

export async function validateMimetypes(
  extensions: string[],
  deps: ValidationDependencies,
): Promise<MimetypeValidationResult> {
  const uploadIndex = await loadFirstUploadIndex(deps.state);
  if (!uploadIndex) {
    return {
      matches: 0,
      mismatches: [
        ValidationCheckResult.create({
          name: 'Upload index',
          ok: false,
          detail: 'Nenhum índice encontrado em .mcp-state/storage/uploads/.',
        }),
      ],
    };
  }

  const expectedSet = new Set(extensions.map((ext) => ext.toLowerCase()));
  const mismatches: ValidationCheckResult[] = [];
  let matches = 0;

  for (const entry of Object.values(uploadIndex.file.files ?? {})) {
    const ext = extname(entry.objectPath).toLowerCase();
    if (!expectedSet.has(ext)) {
      continue;
    }
    const expectedMime = lookupMimeType(entry.objectPath);
    if (!entry.contentType) {
      mismatches.push(
        ValidationCheckResult.create({
          name: entry.objectPath,
          ok: false,
          detail: `Content-Type ausente. Esperado ~ ${expectedMime}`,
        }),
      );
      continue;
    }
    if (!entry.contentType.startsWith(expectedMime.split(';')[0])) {
      mismatches.push(
        ValidationCheckResult.create({
          name: entry.objectPath,
          ok: false,
          detail: `Content-Type "${entry.contentType}" diverge de "${expectedMime}"`,
        }),
      );
      continue;
    }
    matches += 1;
  }

  return { matches, mismatches };
}
