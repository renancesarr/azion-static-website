import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { writeStateFile, statePath } from '../../utils/state.js';
import { walkDirectory } from '../../utils/fs.js';
import { ToolExecutionContext } from '../../models/toolExecutionContext.js';
import { UploadExecution } from '../../models/uploadExecution.js';
import { defaultStorageDependencies } from './dependencies.js';
import type { StorageDependencies } from './types.js';
import { UploadDirInput } from './schemas.js';
import { resolveBucketReference } from './resolveBucketReference.js';
import { loadUploadIndex, saveUploadIndex } from './uploadIndex.js';
import { planUploadCandidates } from './planUploadCandidates.js';
import { executeUploadBatch } from './executeUploadBatch.js';
import { buildUploadReport } from './buildUploadReport.js';
import { uploadIndexRelativePath, uploadLogRelativePath } from './paths.js';

export async function processUploadDir(
  server: McpServer,
  input: UploadDirInput,
  ctx: ToolExecutionContext,
  deps: StorageDependencies = defaultStorageDependencies,
): Promise<UploadExecution> {
  const bucket = await resolveBucketReference(
    { bucketId: input.bucketId, bucketName: input.bucketName },
    deps,
  );

  const localDir = resolve(input.localDir);
  const stats = await fs.stat(localDir);
  if (!stats.isDirectory()) {
    throw new Error(`Caminho ${localDir} não é um diretório.`);
  }

  const startedAt = new Date();
  await server.sendLoggingMessage(
    {
      level: 'info',
      data: `Scan iniciado em ${localDir} para bucket ${bucket.name}.`,
    },
    ctx.sessionId,
  );

  const entries = await walkDirectory(localDir);
  if (entries.length === 0) {
    const finishedAt = new Date();
    const report = buildUploadReport(
      bucket,
      [],
      [],
      [],
      0,
      0,
      input,
      startedAt,
      finishedAt,
    );
    return {
      report,
      summaryLines: [`Diretório ${localDir} não possui arquivos. Nada a fazer.`],
    };
  }

  const index = await loadUploadIndex(bucket);
  const plan = await planUploadCandidates(entries, index, input);

  const plannedUploads = plan.candidates.length;
  const concurrencyInput = input.concurrency ?? deps.uploadConcurrency();
  const maxConcurrency = Math.min(concurrencyInput, Math.max(1, plannedUploads || 1));

  if (input.dryRun) {
    const finishedAt = new Date();
    const report = buildUploadReport(
      bucket,
      plan.skipped,
      [],
      [],
      plannedUploads,
      entries.length,
      input,
      startedAt,
      finishedAt,
    );
    const logFileName = uploadLogRelativePath(finishedAt.toISOString());
    await writeStateFile(logFileName, report);

    return {
      report,
      logFilePath: statePath(logFileName),
      summaryLines: [
        'Dry-run concluído.',
        `- Bucket: ${bucket.name} (${bucket.id})`,
        `- Arquivos analisados: ${entries.length}`,
        `- Reaproveitados: ${plan.skipped.length}`,
        `- Necessários upload: ${plannedUploads}`,
        `- Log: ${statePath(logFileName)}`,
      ],
    };
  }

  const { uploaded, failed } = await executeUploadBatch(
    plan.candidates,
    bucket,
    plan.nextIndexFiles,
    maxConcurrency,
    deps,
  );

  const finishedAt = new Date();
  const report = buildUploadReport(
    bucket,
    plan.skipped,
    uploaded,
    failed,
    plannedUploads,
    entries.length,
    input,
    startedAt,
    finishedAt,
  );
  const logFileName = uploadLogRelativePath(finishedAt.toISOString());
  await writeStateFile(logFileName, report);

  index.files = plan.nextIndexFiles;
  await saveUploadIndex(bucket, index);

  await server.sendLoggingMessage(
    {
      level: failed.length > 0 ? 'error' : 'info',
      data: `Upload concluído: ${uploaded.length} enviados, ${plan.skipped.length} reaproveitados, ${failed.length} falharam.`,
    },
    ctx.sessionId,
  );

  return {
    report,
    logFilePath: statePath(logFileName),
    summaryLines: [
      `Upload finalizado.`,
      `- Bucket: ${bucket.name} (${bucket.id})`,
      `- Arquivos analisados: ${entries.length}`,
      `- Reaproveitados: ${plan.skipped.length}`,
      `- Enviados: ${uploaded.length}`,
      `- Falhas: ${failed.length}`,
      `- Índice: ${statePath(uploadIndexRelativePath(bucket))}`,
      `- Relatório: ${statePath(logFileName)}`,
    ],
  };
}
