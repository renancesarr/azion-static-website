import { promises as fs } from 'node:fs';
import { extname } from 'node:path';
import { performance } from 'node:perf_hooks';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { readStateFile, statePath } from '../utils/state.js';
import { lookupMimeType } from '../utils/mime.js';

const STACK_STATE = {
  bucket: 'storage/storage_buckets.json',
  edgeApp: 'edge/edge_applications.json',
  connector: 'edge/edge_connectors.json',
  cacheRule: 'edge/rules_engine.json',
  domain: 'edge/domains.json',
  firewall: 'security/firewalls.json',
  wafRuleset: 'security/waf_rulesets.json',
  firewallRule: 'security/firewall_rules.json',
};

const validateSchema = z.object({
  project: z.string().optional(),
  domain: z.string().optional(),
  protocol: z.enum(['https', 'http']).default('https'),
  path: z.string().default('/'),
  timeoutMs: z.number().int().min(500).max(30000).default(5000),
});

type ValidateInput = z.infer<typeof validateSchema>;

interface ToolResponse {
  content: Array<{ type: 'text'; text: string }>;
}

interface ToolExecutionContext {
  sessionId?: string;
}

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

interface UploadIndexFile {
  files: Record<string, {
    hash: string;
    size: number;
    objectPath: string;
    updatedAt: string;
    contentType?: string;
    contentEncoding?: string;
    sourcePath?: string;
  }>;
}

interface StackValidationReport {
  project?: string;
  domain?: string;
  protocol: string;
  path: string;
  startedAt: string;
  finishedAt: string;
  checks: CheckResult[];
  http?: {
    url: string;
    status?: number;
    ok: boolean;
    durationMs: number;
    error?: string;
  };
  gzipAssets?: string[];
}

const mimetypeValidationSchema = z.object({
  extensions: z.array(z.string().startsWith('.')).default(['.html', '.css', '.js', '.svg', '.png', '.webp', '.json', '.map']),
});

const idempotencyValidationSchema = z.object({});

const uploadLogInspectSchema = z.object({
  limit: z.number().int().min(1).max(50).default(5),
});

const bucketConflictSchema = z.object({
  bucketName: z.string().min(1),
});

const domainConflictSchema = z.object({
  domainName: z.string().min(1),
});

async function readState<T>(relativePath: string): Promise<T | undefined> {
  return await readStateFile<T>(relativePath);
}

function summarizeState(checkName: string, exists: boolean, detail: string): CheckResult {
  return {
    name: checkName,
    ok: exists,
    detail,
  };
}

function listIds<T extends { id: string }>(collection: Record<string, T> | undefined): string {
  if (!collection) {
    return 'n/d';
  }
  const ids = Object.values(collection).map((item) => item.id);
  return ids.length > 0 ? ids.join(', ') : 'n/d';
}

async function validateStack(input: ValidateInput): Promise<StackValidationReport> {
  const startedAt = new Date();
  const checks: CheckResult[] = [];

  const bucketState = await readState<{ buckets: Record<string, { id: string }> }>(STACK_STATE.bucket);
  checks.push(
    summarizeState(
      'Bucket',
      !!bucketState && Object.keys(bucketState.buckets ?? {}).length > 0,
      bucketState ? `IDs: ${listIds(bucketState.buckets)}` : 'Arquivo não encontrado.',
    ),
  );

  const edgeAppState = await readState<{ applications: Record<string, { id: string }> }>(STACK_STATE.edgeApp);
  checks.push(
    summarizeState(
      'Edge Application',
      !!edgeAppState && Object.keys(edgeAppState.applications ?? {}).length > 0,
      edgeAppState ? `IDs: ${listIds(edgeAppState.applications)}` : 'Arquivo não encontrado.',
    ),
  );

  const connectorState = await readState<{ connectors: Record<string, { id: string }> }>(STACK_STATE.connector);
  checks.push(
    summarizeState(
      'Edge Connector',
      !!connectorState && Object.keys(connectorState.connectors ?? {}).length > 0,
      connectorState ? `IDs: ${listIds(connectorState.connectors)}` : 'Arquivo não encontrado.',
    ),
  );

  const cacheState = await readState<{ rules: Record<string, { id: string }> }>(STACK_STATE.cacheRule);
  checks.push(
    summarizeState(
      'Cache Rule',
      !!cacheState && Object.keys(cacheState.rules ?? {}).length > 0,
      cacheState ? `IDs: ${listIds(cacheState.rules)}` : 'Arquivo não encontrado.',
    ),
  );

  const domainState = await readState<{ domains: Record<string, { id: string; name?: string }> }>(STACK_STATE.domain);
  const domainNames = domainState ? Object.keys(domainState.domains ?? {}) : [];
  checks.push(
    summarizeState(
      'Domain',
      !!domainState && domainNames.length > 0,
      domainState ? `Domínios: ${domainNames.join(', ')}` : 'Arquivo não encontrado.',
    ),
  );

  const firewallState = await readState<{ firewalls: Record<string, { id: string }> }>(STACK_STATE.firewall);
  checks.push(
    summarizeState(
      'Firewall',
      !!firewallState && Object.keys(firewallState.firewalls ?? {}).length > 0,
      firewallState ? `IDs: ${listIds(firewallState.firewalls)}` : 'Arquivo não encontrado.',
    ),
  );

  const rulesetState = await readState<{ rulesets: Record<string, { id: string }> }>(STACK_STATE.wafRuleset);
  checks.push(
    summarizeState(
      'WAF Ruleset',
      !!rulesetState && Object.keys(rulesetState.rulesets ?? {}).length > 0,
      rulesetState ? `IDs: ${listIds(rulesetState.rulesets)}` : 'Arquivo não encontrado.',
    ),
  );

  const firewallRuleState = await readState<{ bindings: Record<string, { id: string }> }>(STACK_STATE.firewallRule);
  checks.push(
    summarizeState(
      'Firewall Rule',
      !!firewallRuleState && Object.keys(firewallRuleState.bindings ?? {}).length > 0,
      firewallRuleState ? `IDs: ${listIds(firewallRuleState.bindings)}` : 'Arquivo não encontrado.',
    ),
  );

  let httpResult: StackValidationReport['http'];
  const domainToTest = input.domain ?? domainNames[0];
  if (domainToTest) {
    const url = `${input.protocol}://${domainToTest}${input.path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), input.timeoutMs);
    const start = performance.now();
    try {
      const response = await fetch(url, { method: 'GET', signal: controller.signal });
      const duration = performance.now() - start;
      httpResult = {
        url,
        status: response.status,
        ok: response.ok,
        durationMs: duration,
        error: response.ok ? undefined : `Status ${response.status}`,
      };
    } catch (error) {
      const duration = performance.now() - start;
      const message = error instanceof Error ? error.message : String(error);
      httpResult = {
        url,
        ok: false,
        durationMs: duration,
        error: message,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  let gzipAssets: string[] | undefined;
  const bucketIds = bucketState ? Object.values(bucketState.buckets ?? {}).map((b) => b.id) : [];
  if (bucketIds.length > 0) {
    const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '_');
    const indexPath = `storage/uploads/index-${sanitize(bucketIds[0])}.json`;
    const uploadIndex = await readState<UploadIndexFile>(indexPath);
    if (uploadIndex) {
      gzipAssets = Object.values(uploadIndex.files ?? {})
        .filter((entry) => entry.contentEncoding === 'gzip')
        .map((entry) => `${entry.objectPath} <= ${entry.sourcePath ?? 'n/d'}`);
      checks.push(
        summarizeState(
          'Gzip Assets',
          (gzipAssets?.length ?? 0) > 0,
          gzipAssets && gzipAssets.length > 0 ? gzipAssets.join(', ') : 'Nenhum objeto com encoding gzip registrado.',
        ),
      );
    }
  }

  const finishedAt = new Date();
  return {
    project: input.project,
    domain: domainToTest,
    protocol: input.protocol,
    path: input.path,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    checks,
    http: httpResult,
    gzipAssets,
  };
}

async function loadFirstUploadIndex(): Promise<{ bucketId: string; file: UploadIndexFile; path: string } | undefined> {
  const bucketState = await readState<{ buckets: Record<string, { id: string }> }>(STACK_STATE.bucket);
  const ids = bucketState ? Object.values(bucketState.buckets ?? {}).map((b) => b.id) : [];
  if (ids.length === 0) {
    return undefined;
  }
  const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '_');
  const relativePath = `storage/uploads/index-${sanitize(ids[0])}.json`;
  const index = await readState<UploadIndexFile>(relativePath);
  if (!index) {
    return undefined;
  }
  return { bucketId: ids[0], file: index, path: relativePath };
}

async function validateMimetypes(extensions: string[]): Promise<{ matches: number; mismatches: CheckResult[] }> {
  const uploadIndex = await loadFirstUploadIndex();
  if (!uploadIndex) {
    return { matches: 0, mismatches: [summarizeState('Upload index', false, 'Nenhum índice encontrado em .mcp-state/storage/uploads/.')] };
  }

  const expectedSet = new Set(extensions.map((ext) => ext.toLowerCase()));
  const mismatches: CheckResult[] = [];
  let matches = 0;
  for (const entry of Object.values(uploadIndex.file.files ?? {})) {
    const ext = extname(entry.objectPath).toLowerCase();
    if (!expectedSet.has(ext)) {
      continue;
    }
    const expectedMime = lookupMimeType(entry.objectPath);
    if (!entry.contentType) {
      mismatches.push({
        name: entry.objectPath,
        ok: false,
        detail: `Content-Type ausente. Esperado ~ ${expectedMime}`,
      });
      continue;
    }
    if (!entry.contentType.startsWith(expectedMime.split(';')[0])) {
      mismatches.push({
        name: entry.objectPath,
        ok: false,
        detail: `Content-Type "${entry.contentType}" diverge de "${expectedMime}"`,
      });
      continue;
    }
    matches += 1;
  }

  return { matches, mismatches };
}

async function validateIdempotencyFromIndex(): Promise<CheckResult[]> {
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

  const checks: CheckResult[] = [
    summarizeState('Objetos únicos', duplicateObjects.length === 0, duplicateObjects.length === 0 ? 'Sem duplicatas.' : `Duplicados: ${duplicateObjects.join(', ')}`),
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

async function inspectUploadLogs(limit: number): Promise<CheckResult[]> {
  const logDir = '.mcp-state/storage/uploads/logs';
  try {
    const entries = await fs.readdir(logDir);
    const latest = entries
      .filter((name) => name.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);
    if (latest.length === 0) {
      return [summarizeState('Upload logs', false, 'Nenhum arquivo em storage/uploads/logs/.')];
    }
    const results: CheckResult[] = [];
    for (const name of latest) {
      const content = JSON.parse(await fs.readFile(`${logDir}/${name}`, 'utf-8'));
      const totals = content?.totals ?? {};
      results.push({
        name: name,
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

async function checkBucketConflict(input: z.infer<typeof bucketConflictSchema>): Promise<CheckResult> {
  const state = await readState<{ buckets: Record<string, { id: string }> }>(STACK_STATE.bucket);
  const match = state?.buckets?.[input.bucketName];
  return summarizeState(
    'Bucket existente',
    !!match,
    match ? `Bucket presente (id=${match.id}). Reexecuções usarão recurso existente.` : 'Bucket não encontrado em cache local.',
  );
}

async function checkDomainConflict(input: z.infer<typeof domainConflictSchema>): Promise<CheckResult> {
  const state = await readState<{ domains: Record<string, { id: string }> }>(STACK_STATE.domain);
  const match = state?.domains?.[input.domainName];
  return summarizeState(
    'Domain existente',
    !!match,
    match ? `Domínio presente (id=${match.id}). Reexecuções evitarão 409.` : 'Domínio não encontrado em cache local.',
  );
}

export function registerValidationTools(server: McpServer): void {
  server.registerTool(
    'azion.validate_stack',
    {
      title: 'Validar provisionamento completo',
      description: 'Confere presença dos artefatos em .mcp-state/ e testa acesso HTTP ao domínio.',
      inputSchema: validateSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = validateSchema.parse(args ?? {});
      const report = await validateStack(parsed);

      const okChecks = report.checks.filter((c) => c.ok).length;
      const httpSummary = report.http
        ? report.http.ok
          ? `HTTP ${report.http.status} em ${report.http.durationMs.toFixed(1)}ms`
          : `HTTP falhou (${report.http.error ?? 'erro desconhecido'})`
        : 'HTTP não executado (domínio ausente)';

      const summary = [
        `Validação de stack ${parsed.project ?? ''}`.trim(),
        `- Checks: ${okChecks}/${report.checks.length} OK`,
        `- HTTP: ${httpSummary}`,
        `- Domínio: ${report.domain ?? 'n/d'}`,
      ];

      if (report.http?.error) {
        summary.push(`- URL: ${report.http.url}`);
      }

      summary.push('', 'Detalhes:');
      for (const check of report.checks) {
        summary.push(`- ${check.name}: ${check.ok ? 'OK' : 'FALHA'} (${check.detail})`);
      }

      return {
        content: [
          {
            type: 'text',
            text: summary.join('\n'),
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.validate_mimetypes',
    {
      title: 'Verificar mimetypes de uploads',
      description: 'Confere se os objetos no índice de upload possuem Content-Type esperado por extensão.',
      inputSchema: mimetypeValidationSchema,
    },
    async (args: unknown): Promise<ToolResponse> => {
      const parsed = mimetypeValidationSchema.parse(args ?? {});
      const result = await validateMimetypes(parsed.extensions);
      const summary: string[] = [];
      summary.push(`Extensões auditadas: ${parsed.extensions.join(', ')}`);
      summary.push(`Objetos válidos: ${result.matches}`);
      if (result.mismatches.length > 0) {
        summary.push('', 'Inconsistências:');
        for (const mismatch of result.mismatches) {
          summary.push(`- ${mismatch.name}: ${mismatch.detail}`);
        }
      } else {
        summary.push('- Nenhum problema encontrado.');
      }
      return {
        content: [
          {
            type: 'text',
            text: summary.join('\n'),
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.validate_upload_idempotency',
    {
      title: 'Checar idempotência de uploads',
      description: 'Valida se o índice de uploads mantém hash único por objeto e facilita reexecução sem reenvio.',
      inputSchema: idempotencyValidationSchema,
    },
    async (): Promise<ToolResponse> => {
      const checks = await validateIdempotencyFromIndex();
      const summary = checks.map((check) => `- ${check.name}: ${check.ok ? 'OK' : 'FALHA'} (${check.detail})`);
      return {
        content: [
          {
            type: 'text',
            text: ['Verificação de idempotência:', ...summary].join('\n'),
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.inspect_upload_logs',
    {
      title: 'Resumir logs de upload',
      description: 'Lê os últimos relatórios de upload e mostra quantitativos de sucesso/falhas.',
      inputSchema: uploadLogInspectSchema,
    },
    async (args: unknown): Promise<ToolResponse> => {
      const parsed = uploadLogInspectSchema.parse(args ?? {});
      const checks = await inspectUploadLogs(parsed.limit);
      const summary = checks.map((check) => `- ${check.name}: ${check.detail}`);
      return {
        content: [
          {
            type: 'text',
            text: ['Últimos logs de upload:', ...summary].join('\n'),
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.verify_bucket_conflict',
    {
      title: 'Verificar existência de bucket',
      description: 'Confirma se um bucket já aparece em .mcp-state (indicando reuso e prevenção de 409).',
      inputSchema: bucketConflictSchema,
    },
    async (args: unknown): Promise<ToolResponse> => {
      const parsed = bucketConflictSchema.parse(args ?? {});
      const result = await checkBucketConflict(parsed);
      return {
        content: [
          {
            type: 'text',
            text: `${result.name}: ${result.ok ? 'OK' : 'NÃO ENCONTRADO'} (${result.detail})`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'azion.verify_domain_conflict',
    {
      title: 'Verificar existência de domain',
      description: 'Confirma se domínio já está registrado em .mcp-state para prevenir 409.',
      inputSchema: domainConflictSchema,
    },
    async (args: unknown): Promise<ToolResponse> => {
      const parsed = domainConflictSchema.parse(args ?? {});
      const result = await checkDomainConflict(parsed);
      return {
        content: [
          {
            type: 'text',
            text: `${result.name}: ${result.ok ? 'OK' : 'NÃO ENCONTRADO'} (${result.detail})`,
          },
        ],
      };
    },
  );
}
