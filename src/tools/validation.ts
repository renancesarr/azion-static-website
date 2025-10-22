import { performance } from 'node:perf_hooks';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { readStateFile, statePath } from '../utils/state.js';

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
}

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
  };
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
}
