import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { azionApiBase, uploadConcurrency } from '../utils/env.js';
import { http, HttpError } from '../utils/http.js';
import { readStateFile, writeStateFile, statePath } from '../utils/state.js';
import { walkDirectory } from '../utils/fs.js';
import { hashFileSHA256 } from '../utils/hash.js';
import { runWithPool } from '../utils/concurrency.js';
import { inferEncoding, lookupMimeType } from '../utils/mime.js';
import type { EnsureResult } from '../utils/ensure.js';

const STORAGE_STATE_FILE = 'storage/storage_buckets.json';
const UPLOAD_STATE_DIR = 'storage/uploads';
const UPLOAD_LOG_DIR = 'storage/uploads/logs';

const createBucketSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres.')
    .max(63, 'Nome deve ter no máximo 63 caracteres.')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens.'),
  edgeAccess: z
    .enum(['read_only', 'public', 'authenticated', 'private'])
    .default('read_only')
    .describe('Política de acesso padrão do bucket.'),
  description: z.string().max(255, 'Descrição deve ter até 255 caracteres.').optional(),
  region: z.string().optional(),
});

export const createBucketInputSchema = createBucketSchema;

const putObjectSchema = z
  .object({
    bucketId: z.string().optional(),
    bucketName: z.string().optional(),
    objectPath: z.string().min(1, 'Informe o caminho do objeto no bucket.'),
    contentBase64: z.string().min(1, 'Conteúdo base64 obrigatório.'),
    contentType: z.string().optional(),
    contentEncoding: z.string().optional(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/i, 'SHA256 deve ser hex de 64 caracteres.').optional(),
  })
  .refine((value) => value.bucketId || value.bucketName, {
    message: 'Informe bucketId ou bucketName.',
    path: ['bucketId'],
  });

const uploadDirSchema = z
  .object({
    bucketId: z.string().optional(),
    bucketName: z.string().optional(),
    localDir: z.string().min(1, 'Informe o diretório local a ser publicado.'),
    prefix: z.string().optional(),
    concurrency: z.number().int().min(1).max(32).optional(),
    dryRun: z.boolean().default(false),
    stripGzipExtension: z.boolean().default(false),
  })
  .refine((value) => value.bucketId || value.bucketName, {
    message: 'Informe bucketId ou bucketName.',
    path: ['bucketId'],
  });

export const uploadDirInputSchema = uploadDirSchema;

export type CreateBucketInput = z.infer<typeof createBucketSchema>;
type PutObjectInput = z.infer<typeof putObjectSchema>;
export type UploadDirInput = z.infer<typeof uploadDirSchema>;

export interface StorageBucketRecord {
  id: string;
  name: string;
  edgeAccess?: string;
  description?: string;
  region?: string;
  createdAt: string;
  raw: unknown;
}

interface StorageBucketsState {
  buckets: Record<string, StorageBucketRecord>;
}

interface AzionBucketPayload {
  id: string;
  name: string;
  edge_access?: string;
  description?: string;
  region?: string;
  created_at?: string;
  [key: string]: unknown;
}

interface AzionCreateBucketResponse {
  results?: AzionBucketPayload;
  data?: AzionBucketPayload;
}

interface AzionListBucketsResponse {
  results: AzionBucketPayload[];
}

interface AzionBucketResponse {
  results?: AzionBucketPayload;
  data?: AzionBucketPayload;
}

interface ToolResponse {
  content: Array<{ type: 'text'; text: string }>;
}

interface ToolExecutionContext {
  sessionId?: string;
}

interface UploadIndexEntry {
  hash: string;
  size: number;
  objectPath: string;
  updatedAt: string;
}

interface UploadIndexFile {
  bucketId: string;
  bucketName: string;
  files: Record<string, UploadIndexEntry>;
  updatedAt: string;
}

interface UploadCandidate {
  absolutePath: string;
  relativePath: string;
  objectPath: string;
  hash: string;
  size: number;
  contentType: string;
  contentEncoding?: string;
}

interface UploadReportEntry {
  objectPath: string;
  hash: string;
  size: number;
  status: 'uploaded' | 'skipped' | 'failed';
  attempts: number;
  error?: string;
}

export interface UploadRunReport {
  bucketId: string;
  bucketName: string;
  prefix?: string;
  dryRun: boolean;
  totals: {
    scanned: number;
    skipped: number;
    toUpload: number;
    uploaded: number;
    failed: number;
  };
  startedAt: string;
  finishedAt: string;
  entries: UploadReportEntry[];
}

function normalizeState(state?: StorageBucketsState): StorageBucketsState {
  if (!state) {
    return { buckets: {} };
  }

  return {
    buckets: state.buckets ?? {},
  };
}

function sanitizeFileSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function uploadIndexRelativePath(bucket: StorageBucketRecord): string {
  return `${UPLOAD_STATE_DIR}/index-${sanitizeFileSegment(bucket.id || bucket.name)}.json`;
}

function uploadLogRelativePath(timestamp: string): string {
  return `${UPLOAD_LOG_DIR}/upload-${timestamp}.json`;
}

function buildBucketRecord(payload: AzionBucketPayload): StorageBucketRecord {
  return {
    id: payload.id,
    name: payload.name,
    edgeAccess: payload.edge_access,
    description: payload.description,
    region: payload.region,
    createdAt: typeof payload.created_at === 'string' ? payload.created_at : new Date().toISOString(),
    raw: payload,
  };
}

async function persistBucket(bucket: StorageBucketRecord): Promise<StorageBucketRecord> {
  const current = normalizeState(await readStateFile<StorageBucketsState>(STORAGE_STATE_FILE));
  const existing = current.buckets[bucket.name];
  const record: StorageBucketRecord = existing
    ? {
        ...existing,
        ...bucket,
        createdAt: existing.createdAt ?? bucket.createdAt,
      }
    : bucket;
  current.buckets[record.name] = record;
  await writeStateFile(STORAGE_STATE_FILE, current);
  return record;
}

async function lookupPersistedBucketByName(name: string): Promise<StorageBucketRecord | undefined> {
  const current = normalizeState(await readStateFile<StorageBucketsState>(STORAGE_STATE_FILE));
  return current.buckets[name];
}

export async function ensureBucket(input: CreateBucketInput): Promise<EnsureResult<StorageBucketRecord>> {
  const existing = await lookupPersistedBucketByName(input.name);
  if (existing) {
    return { record: existing, created: false };
  }
  const record = await createBucketViaApi(input);
  return { record, created: true };
}

async function lookupPersistedBucketById(id: string): Promise<StorageBucketRecord | undefined> {
  const current = normalizeState(await readStateFile<StorageBucketsState>(STORAGE_STATE_FILE));
  return Object.values(current.buckets).find((bucket) => bucket.id === id);
}

async function createBucketViaApi(input: CreateBucketInput): Promise<StorageBucketRecord> {
  const apiBase = azionApiBase();
  try {
    const response = await http<AzionCreateBucketResponse>({
      method: 'POST',
      url: `${apiBase}/v4/storage/buckets`,
      body: {
        name: input.name,
        edge_access: input.edgeAccess,
        description: input.description,
        region: input.region,
      },
    });

    const payload = response.data.results ?? response.data.data ?? (response.data as unknown as AzionBucketPayload);
    return await persistBucket(buildBucketRecord(payload));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      const bucket = await findBucketByName(input.name);
      if (bucket) {
        return await persistBucket(buildBucketRecord(bucket));
      }
    }
    throw error;
  }
}

async function findBucketByName(name: string): Promise<AzionBucketPayload | undefined> {
  const apiBase = azionApiBase();
  try {
    const response = await http<AzionListBucketsResponse>({
      method: 'GET',
      url: `${apiBase}/v4/storage/buckets?name=${encodeURIComponent(name)}`,
    });
    return response.data.results?.find((bucket) => bucket.name === name);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

async function fetchBucketById(id: string): Promise<AzionBucketPayload | undefined> {
  const apiBase = azionApiBase();
  try {
    const response = await http<AzionBucketResponse>({
      method: 'GET',
      url: `${apiBase}/v4/storage/buckets/${encodeURIComponent(id)}`,
    });
    return response.data.results ?? response.data.data ?? (response.data as unknown as AzionBucketPayload);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

async function resolveBucketReference(ref: { bucketId?: string; bucketName?: string }): Promise<StorageBucketRecord> {
  if (ref.bucketId) {
    const cached = await lookupPersistedBucketById(ref.bucketId);
    if (cached) {
      return cached;
    }
    const apiBucket = await fetchBucketById(ref.bucketId);
    if (!apiBucket) {
      throw new Error(`Bucket com id ${ref.bucketId} não localizado na API Azion.`);
    }
    return await persistBucket(buildBucketRecord(apiBucket));
  }

  if (ref.bucketName) {
    const cached = await lookupPersistedBucketByName(ref.bucketName);
    if (cached) {
      return cached;
    }
    const apiBucket = await findBucketByName(ref.bucketName);
    if (!apiBucket) {
      throw new Error(`Bucket com nome ${ref.bucketName} não localizado na API Azion.`);
    }
    return await persistBucket(buildBucketRecord(apiBucket));
  }

  throw new Error('Referência de bucket ausente.');
}

function buildBucketToolResult(message: string, bucket: StorageBucketRecord): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: `${message}\n- Bucket: ${bucket.name}\n- ID: ${bucket.id}\n- Edge Access: ${bucket.edgeAccess ?? 'n/d'}\n- State File: ${statePath(STORAGE_STATE_FILE)}`,
      },
    ],
  };
}

function normalizeObjectPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '');
}

function applyPrefix(path: string, prefix?: string): string {
  if (!prefix) {
    return path;
  }
  const trimmedPrefix = normalizeObjectPath(prefix).replace(/\/+$/, '');
  if (!trimmedPrefix) {
    return path;
  }
  return `${trimmedPrefix}/${path}`;
}

function buildObjectUrl(bucketId: string, objectPath: string): string {
  const apiBase = azionApiBase();
  const encoded = objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${apiBase}/v4/storage/buckets/${encodeURIComponent(bucketId)}/objects/${encoded}`;
}

async function loadUploadIndex(bucket: StorageBucketRecord): Promise<UploadIndexFile> {
  const path = uploadIndexRelativePath(bucket);
  const existing = await readStateFile<UploadIndexFile>(path);
  if (existing && existing.bucketId === bucket.id) {
    return existing;
  }
  return {
    bucketId: bucket.id,
    bucketName: bucket.name,
    files: existing?.files ?? {},
    updatedAt: new Date().toISOString(),
  };
}

async function saveUploadIndex(bucket: StorageBucketRecord, index: UploadIndexFile): Promise<void> {
  const safeIndex: UploadIndexFile = {
    bucketId: bucket.id,
    bucketName: bucket.name,
    files: index.files,
    updatedAt: new Date().toISOString(),
  };
  await writeStateFile(uploadIndexRelativePath(bucket), safeIndex);
}

function makeReportEntry(base: UploadCandidate, status: UploadReportEntry['status'], attempts: number, error?: Error): UploadReportEntry {
  return {
    objectPath: base.objectPath,
    hash: base.hash,
    size: base.size,
    status,
    attempts,
    error: error ? `${error.name}: ${error.message}` : undefined,
  };
}

async function handlePutObject(server: McpServer, input: PutObjectInput, ctx: ToolExecutionContext): Promise<ToolResponse> {
  const bucket = await resolveBucketReference({ bucketId: input.bucketId, bucketName: input.bucketName });
  const objectPath = applyPrefix(normalizeObjectPath(input.objectPath), undefined);

  const buffer = Buffer.from(input.contentBase64, 'base64');
  const hash = input.sha256 ?? (await hashFileSHA256FromBuffer(buffer));
  const { contentType, contentEncoding } =
    input.contentType || input.contentEncoding ? { contentType: input.contentType ?? lookupMimeType(objectPath), contentEncoding: input.contentEncoding } : inferEncoding(objectPath);

  await http({
    method: 'PUT',
    url: buildObjectUrl(bucket.id, objectPath),
    body: buffer,
    headers: {
      'Content-Type': contentType,
      ...(contentEncoding ? { 'Content-Encoding': contentEncoding } : {}),
      'X-Checksum-Sha256': hash,
    },
  });

  const index = await loadUploadIndex(bucket);
  index.files[objectPath] = {
    hash,
    size: buffer.length,
    objectPath,
    updatedAt: new Date().toISOString(),
  };
  await saveUploadIndex(bucket, index);

  await server.sendLoggingMessage(
    {
      level: 'info',
      data: `Objeto ${objectPath} enviado ao bucket ${bucket.name}.`,
    },
    ctx.sessionId,
  );

  return {
    content: [
      {
        type: 'text',
        text: `Objeto publicado com sucesso.\n- Bucket: ${bucket.name} (${bucket.id})\n- Path: ${objectPath}\n- Bytes: ${buffer.length}\n- SHA256: ${hash}\n- Index: ${statePath(uploadIndexRelativePath(bucket))}`,
      },
    ],
  };
}

async function hashFileSHA256FromBuffer(buffer: Buffer): Promise<string> {
  const hash = createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

export interface UploadExecution {
  report: UploadRunReport;
  summaryLines: string[];
  logFilePath?: string;
}

export async function processUploadDir(server: McpServer, input: UploadDirInput, ctx: ToolExecutionContext): Promise<UploadExecution> {
  const bucket = await resolveBucketReference({ bucketId: input.bucketId, bucketName: input.bucketName });

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
    const report = buildUploadReport(bucket, [], [], [], 0, 0, input, startedAt, finishedAt);
    return {
      report,
      summaryLines: [`Diretório ${localDir} não possui arquivos. Nada a fazer.`],
    };
  }

  const index = await loadUploadIndex(bucket);
  const nextIndexFiles: Record<string, UploadIndexEntry> = {};
  const candidates: UploadCandidate[] = [];
  const skipped: UploadReportEntry[] = [];

  for (const entry of entries) {
    const objectPath = applyPrefix(
      normalizeObjectPath(
        input.stripGzipExtension && entry.relativePath.toLowerCase().endsWith('.gz') ? entry.relativePath.slice(0, -3) : entry.relativePath,
      ),
      input.prefix,
    );

    const hash = await hashFileSHA256(entry.absolutePath);
    const encodingInfo = inferEncoding(entry.relativePath);
    const contentType = encodingInfo.contentType;
    const contentEncoding = encodingInfo.contentEncoding;
    const candidate: UploadCandidate = {
      absolutePath: entry.absolutePath,
      relativePath: entry.relativePath,
      objectPath,
      hash,
      size: entry.size,
      contentType,
      contentEncoding,
    };

    const previous = index.files[objectPath];
    if (previous && previous.hash === hash) {
      skipped.push(makeReportEntry(candidate, 'skipped', 0));
      nextIndexFiles[objectPath] = {
        ...previous,
        hash,
        size: entry.size,
        updatedAt: new Date().toISOString(),
      };
      continue;
    }

    candidates.push(candidate);
  }

  const plannedUploads = candidates.length;
  const concurrency = input.concurrency ?? uploadConcurrency();
  const maxConcurrency = Math.min(concurrency, Math.max(1, plannedUploads || 1));

  if (input.dryRun) {
    const finishedAt = new Date();
    const report = buildUploadReport(bucket, skipped, [], [], plannedUploads, entries.length, input, startedAt, finishedAt);
    const logFileName = uploadLogRelativePath(report.finishedAt.replace(/[:.]/g, '-'));
    await writeStateFile(logFileName, report);

    return {
      report,
      logFilePath: statePath(logFileName),
      summaryLines: [
        `Dry-run concluído.`,
        `- Bucket: ${bucket.name} (${bucket.id})`,
        `- Arquivos analisados: ${entries.length}`,
        `- Reaproveitados: ${skipped.length}`,
        `- Necessários upload: ${plannedUploads}`,
        `- Log: ${statePath(logFileName)}`,
      ],
    };
  }

  const uploadTasks = candidates.map((candidate) => {
    return async (): Promise<UploadReportEntry> => {
      const buffer = await fs.readFile(candidate.absolutePath);
      await http({
        method: 'PUT',
        url: buildObjectUrl(bucket.id, candidate.objectPath),
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
      };
      return makeReportEntry(candidate, 'uploaded', 1);
    };
  });

  const poolResults = await runWithPool(uploadTasks, {
    concurrency: maxConcurrency,
    maxRetries: 2,
    retryDelayMs: 750,
  });

  const uploaded: UploadReportEntry[] = [];
  const failed: UploadReportEntry[] = [];

  poolResults.forEach((result, index) => {
    const candidate = candidates[index];
    if (result.error) {
      failed.push(makeReportEntry(candidate, 'failed', result.attempts, result.error));
      delete nextIndexFiles[candidate.objectPath];
      return;
    }
    uploaded.push({
      ...result.value!,
      attempts: result.attempts,
    });
  });

  const finishedAt = new Date();
  const report = buildUploadReport(bucket, skipped, uploaded, failed, plannedUploads, entries.length, input, startedAt, finishedAt);
  const logFileName = uploadLogRelativePath(finishedAt.toISOString().replace(/[:.]/g, '-'));
  await writeStateFile(logFileName, report);

  index.files = nextIndexFiles;
  await saveUploadIndex(bucket, index);

  await server.sendLoggingMessage(
    {
      level: failed.length > 0 ? 'error' : 'info',
      data: `Upload concluído: ${uploaded.length} enviados, ${skipped.length} reaproveitados, ${failed.length} falharam.`,
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
      `- Reaproveitados: ${skipped.length}`,
      `- Enviados: ${uploaded.length}`,
      `- Falhas: ${failed.length}`,
      `- Índice: ${statePath(uploadIndexRelativePath(bucket))}`,
      `- Relatório: ${statePath(logFileName)}`,
    ],
  };
}

function buildUploadReport(
  bucket: StorageBucketRecord,
  skipped: UploadReportEntry[],
  uploaded: UploadReportEntry[],
  failed: UploadReportEntry[],
  plannedUploads: number,
  scanned: number,
  input: UploadDirInput,
  startedAt: Date,
  finishedAt: Date,
): UploadRunReport {
  return {
    bucketId: bucket.id,
    bucketName: bucket.name,
    prefix: input.prefix,
    dryRun: input.dryRun,
    totals: {
      scanned,
      skipped: skipped.length,
      toUpload: plannedUploads,
      uploaded: uploaded.length,
      failed: failed.length,
    },
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    entries: [...skipped, ...uploaded, ...failed],
  };
}

export function registerStorageTools(server: McpServer): void {
  server.registerTool(
    'azion.create_bucket',
    {
      title: 'Criar bucket no Edge Storage',
      description: 'Provisiona bucket na Azion com idempotência. Persiste metadados em .mcp-state.',
      inputSchema: createBucketSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = createBucketSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const existing = await lookupPersistedBucketByName(parsed.name);
      if (existing) {
        await server.sendLoggingMessage(
          {
            level: 'info',
            data: `Bucket ${parsed.name} já registrado em cache local. Pulando criação.`,
          },
          sessionId,
        );
        return buildBucketToolResult('Bucket reutilizado a partir do estado local.', existing);
      }

      const record = await createBucketViaApi(parsed);
      await server.sendLoggingMessage(
        {
          level: 'info',
          data: `Bucket ${parsed.name} criado ou recuperado via API.`,
        },
        sessionId,
      );

      return buildBucketToolResult('Bucket provisionado com sucesso.', record);
    },
  );

  server.registerTool(
    'azion.put_object',
    {
      title: 'Enviar objeto individual ao Edge Storage',
      description: 'Realiza upload de um único arquivo (conteúdo base64) para o bucket especificado.',
      inputSchema: putObjectSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = putObjectSchema.parse(args ?? {});
      return await handlePutObject(server, parsed, extra);
    },
  );

  server.registerTool(
    'azion.upload_dir',
    {
      title: 'Upload de diretório completo',
      description:
        'Publica um diretório local inteiro no bucket Azion. Reaproveita uploads anteriores via hash, suporta dry-run e gera relatórios em .mcp-state.',
      inputSchema: uploadDirSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = uploadDirSchema.parse(args ?? {});
      const execution = await processUploadDir(server, parsed, extra);
      return {
        content: [
          {
            type: 'text',
            text: execution.summaryLines.join('\n'),
          },
        ],
      };
    },
  );
}
