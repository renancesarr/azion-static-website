import { promises as fs } from 'node:fs';
import { UploadCandidate } from '../../models/uploadCandidate.js';
import { UploadIndexEntry } from '../../models/uploadIndexEntry.js';
import { StorageBucketRecord } from '../../models/storageBucketRecord.js';
import { runWithPool } from '../../utils/concurrency.js';
import { defaultStorageDependencies } from './dependencies.js';
import type { StorageDependencies, UploadBatchResult } from './types.js';
import { buildUploadReportEntry } from './buildUploadReportEntry.js';
import { buildObjectUrl } from './buildObjectUrl.js';

export async function executeUploadBatch(
  candidates: UploadCandidate[],
  bucket: StorageBucketRecord,
  nextIndexFiles: Record<string, UploadIndexEntry>,
  maxConcurrency: number,
  deps: StorageDependencies = defaultStorageDependencies,
): Promise<UploadBatchResult> {
  const uploadTasks = candidates.map((candidate) => {
    return async (): Promise<UploadBatchResult['uploaded'][number]> => {
      const buffer = await fs.readFile(candidate.absolutePath);

      await deps.http.request({
        method: 'PUT',
        url: buildObjectUrl(deps.apiBase, bucket.id, candidate.objectPath),
        body: buffer,
        headers: {
          'Content-Type': candidate.contentType,
          ...(candidate.contentEncoding ? { 'Content-Encoding': candidate.contentEncoding } : {}),
          'X-Checksum-Sha256': candidate.hash,
        },
      });

      nextIndexFiles[candidate.objectPath] = {
        hash: candidate.hash,
        size: candidate.size,
        objectPath: candidate.objectPath,
        updatedAt: new Date().toISOString(),
        contentType: candidate.contentType,
        contentEncoding: candidate.contentEncoding,
        sourcePath: candidate.relativePath,
      };

      return buildUploadReportEntry(candidate, 'uploaded', 1);
    };
  });

  const poolResults = await runWithPool(uploadTasks, {
    concurrency: maxConcurrency,
    maxRetries: 2,
    retryDelayMs: 750,
  });

  const uploaded: UploadBatchResult['uploaded'] = [];
  const failed: UploadBatchResult['failed'] = [];

  poolResults.forEach((result, index) => {
    const candidate = candidates[index];
    if (result.error) {
      failed.push(buildUploadReportEntry(candidate, 'failed', result.attempts, result.error));
      delete nextIndexFiles[candidate.objectPath];
      deps.logger.error(
        `Falha ao enviar ${candidate.objectPath}: ${result.error.message ?? result.error}. tentativas=${result.attempts}`,
      );
      return;
    }

    uploaded.push({
      ...result.value!,
      attempts: result.attempts,
    });
  });

  return { uploaded, failed };
}
