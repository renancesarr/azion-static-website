import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import {
  createBucketInputSchema,
  ensureBucket,
  uploadDirInputSchema,
  type CreateBucketInput,
  type UploadDirInput,
  processUploadDir,
  type UploadExecution,
} from './storage.js';
import {
  createEdgeApplicationInputSchema,
  ensureEdgeApplication,
  ensureEdgeConnector,
  ensureCacheRule,
  type CreateEdgeAppInput,
  type CreateConnectorInput,
  type CreateRuleInput,
} from './edge.js';
import { createDomainInputSchema, ensureDomain, type CreateDomainInput } from './domain.js';
import {
  configureWafInputSchema,
  ensureWaf,
  ensureFirewall,
  ensureWafRuleset,
  ensureFirewallRule,
  type CreateFirewallInput,
  type CreateWafRulesetInput,
  type ApplyWafRulesetInput,
} from './security.js';
import { writeStateFile, statePath } from '../utils/state.js';
import {
  postDeployCheckSchema,
  executePostDeployCheck,
  persistPostDeployReport,
  type PostDeployCheckInput,
} from './postDeploy.js';

const ORCHESTRATION_STATE_DIR = 'orchestration/runs';

const connectorOrchestratorSchema = z.object({
  name: z.string().min(3),
  originPath: z.string().optional(),
  bucketId: z.string().optional(),
  bucketName: z.string().optional(),
});

const cacheRuleOrchestratorSchema = z.object({
  phase: z.enum(['request', 'response']).default('request'),
  behaviors: z
    .array(
      z.object({
        name: z.string(),
        target: z.unknown().optional(),
      }),
    )
    .default([]),
  criteria: z
    .array(
      z.object({
        name: z.string(),
        arguments: z.array(z.string()).default([]),
        variable: z.string().optional(),
        operator: z.string().optional(),
        isNegated: z.boolean().optional(),
      }),
    )
    .default([]),
  description: z.string().optional(),
  order: z.number().int().optional(),
});

const uploadConfigSchema = z.object({
  localDir: z.string().min(1),
  prefix: z.string().optional(),
  concurrency: z.number().int().min(1).max(32).optional(),
  dryRun: z.boolean().optional(),
  stripGzipExtension: z.boolean().optional(),
});

const orchestrateSchema = z.object({
  project: z.string().min(1),
  bucket: createBucketInputSchema,
  upload: uploadConfigSchema.optional(),
  edgeApplication: createEdgeApplicationInputSchema,
  connector: connectorOrchestratorSchema,
  cacheRules: z.array(cacheRuleOrchestratorSchema).default([]),
  domain: z.object({
    name: z.string().min(3),
    isActive: z.boolean().default(true),
    cname: z.string().optional(),
  }),
  waf: z
    .object({
      enable: z.boolean().default(true),
      mode: z.enum(['learning', 'blocking']).default('blocking'),
      wafId: z.string().optional(),
    })
    .optional(),
  firewall: z
    .object({
      name: z.string().min(3).max(128).optional(),
      domainIds: z.array(z.string()).optional(),
      domainNames: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    })
    .optional(),
  wafRuleset: z
    .object({
      name: z.string().min(3).max(128).optional(),
      mode: z.enum(['learning', 'blocking']).optional(),
      description: z.string().optional(),
    })
    .optional(),
  firewallRule: z
    .object({
      order: z.number().int().min(0).default(0),
    })
    .optional(),
  postDeploy: postDeployCheckSchema.optional(),
});

type OrchestrateInput = z.infer<typeof orchestrateSchema>;
type ConnectorConfig = z.infer<typeof connectorOrchestratorSchema>;
type CacheRuleConfig = z.infer<typeof cacheRuleOrchestratorSchema>;
type UploadConfig = z.infer<typeof uploadConfigSchema>;

interface ToolResponse {
  content: Array<{ type: 'text'; text: string }>;
}

interface ToolExecutionContext {
  sessionId?: string;
}

interface OrchestrationReport {
  project: string;
  startedAt: string;
  finishedAt: string;
  bucket: {
    name: string;
    id: string;
    created: boolean;
  };
  upload?: {
    planned: number;
    executed: number;
    skipped: number;
    logFile: string;
  };
  edgeApplication: {
    id: string;
    name: string;
    created: boolean;
  };
  connector: {
    id: string;
    name: string;
    created: boolean;
  };
  cacheRules: Array<{
    id: string;
    phase: string;
    order: number;
    created: boolean;
  }>;
  domain: {
    id: string;
    name: string;
    created: boolean;
  };
  waf: {
    id: string;
    mode: string;
    enabled: boolean;
    created: boolean;
  };
  firewall: {
    id: string;
    name: string;
    created: boolean;
  };
  wafRuleset: {
    id: string;
    name: string;
    mode: string;
    created: boolean;
  };
  firewallRule: {
    id: string;
    order: number;
    created: boolean;
  };
  postDeploy?: {
    success: number;
    failures: number;
    successRate: number;
    avgMs: number;
    minMs: number;
    maxMs: number;
    reportFile: string;
  };
  notes: string[];
}

function buildConnectorInput(
  connector: ConnectorConfig,
  bucket: { id: string; name: string },
): CreateConnectorInput & { bucketId: string; bucketName?: string } {
  return {
    name: connector.name,
    originPath: connector.originPath,
    bucketId: connector.bucketId ?? bucket.id,
    bucketName: connector.bucketName ?? bucket.name,
  };
}

function buildRuleInputs(rules: CacheRuleConfig[], edgeApplicationId: string): CreateRuleInput[] {
  if (rules.length === 0) {
    return [
      {
        edgeApplicationId,
        phase: 'request',
        behaviors: [{ name: 'cache' }],
        criteria: [],
        description: 'default-cache-static',
        order: 0,
      },
    ];
  }

  return rules.map((rule, index) => ({
    edgeApplicationId,
    phase: rule.phase ?? 'request',
    behaviors: rule.behaviors.length > 0 ? rule.behaviors : [{ name: 'cache' }],
    criteria: rule.criteria,
    description: rule.description ?? `rule-${index + 1}`,
    order: rule.order ?? index,
  }));
}

async function persistReport(report: OrchestrationReport): Promise<string> {
  const timestamp = report.finishedAt.replace(/[:.]/g, '-');
  const relativePath = `${ORCHESTRATION_STATE_DIR}/provision-${timestamp}.json`;
  await writeStateFile(relativePath, report);
  return relativePath;
}

function summarizeRecord<T extends { id: string; name?: string }>(record: T): string {
  if ('name' in record && record.name) {
    return `${record.name} (${record.id})`;
  }
  return record.id;
}

export function registerOrchestratorTools(server: McpServer): void {
  server.registerTool(
    'azion.provision_static_site',
    {
      title: 'Provisionar site estático (orquestração completa)',
      description:
        'Executa o fluxo completo: bucket → edge application → connector → rules → domain → WAF. Upload (opcional) é executado se configurado.',
      inputSchema: orchestrateSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = orchestrateSchema.parse(args ?? {});
      const sessionId = extra.sessionId;

      const startedAt = new Date();
      const notes: string[] = [];

      const log = async (level: 'info' | 'error', message: string) => {
        await server.sendLoggingMessage({ level, data: message }, sessionId);
      };

      await log('info', `Iniciando provisionamento do projeto ${parsed.project}.`);

      const bucketResult = await ensureBucket(parsed.bucket as CreateBucketInput);
      await log('info', bucketResult.created ? `Bucket criado: ${summarizeRecord(bucketResult.record)}` : `Bucket reutilizado: ${summarizeRecord(bucketResult.record)}`);

      let uploadInfo: OrchestrationReport['upload'] | undefined;
      if (parsed.upload) {
        const uploadInput = {
          bucketId: bucketResult.record.id,
          bucketName: bucketResult.record.name,
          localDir: parsed.upload.localDir,
          prefix: parsed.upload.prefix,
          concurrency: parsed.upload.concurrency,
          dryRun: parsed.upload.dryRun ?? false,
          stripGzipExtension: parsed.upload.stripGzipExtension ?? false,
        } satisfies UploadDirInput;

        const uploadExecution: UploadExecution = await processUploadDir(server, uploadInput, extra);
        const totals = uploadExecution.report.totals;
        uploadInfo = {
          planned: totals.toUpload,
          executed: totals.uploaded,
          skipped: totals.skipped,
          logFile: uploadExecution.logFilePath ?? 'n/d',
        };

        await log(
          totals.failed > 0 ? 'error' : 'info',
          `Upload ${uploadExecution.report.dryRun ? 'dry-run ' : ''}concluído: enviados=${totals.uploaded}, pulados=${totals.skipped}, falhas=${totals.failed}.`,
        );

        notes.push(...uploadExecution.summaryLines);
      }

      const edgeResult = await ensureEdgeApplication(parsed.edgeApplication as CreateEdgeAppInput);
      await log('info', edgeResult.created ? `Edge Application criada: ${summarizeRecord(edgeResult.record)}` : `Edge Application reutilizada: ${summarizeRecord(edgeResult.record)}`);

      const connectorInput = buildConnectorInput(parsed.connector, {
        id: bucketResult.record.id,
        name: bucketResult.record.name,
      });
      const connectorResult = await ensureEdgeConnector(connectorInput);
      await log(
        'info',
        connectorResult.created
          ? `Connector criado: ${summarizeRecord(connectorResult.record)}`
          : `Connector reutilizado: ${summarizeRecord(connectorResult.record)}`,
      );

      const ruleInputs = buildRuleInputs(parsed.cacheRules, edgeResult.record.id);
      if (parsed.cacheRules.length === 0) {
        notes.push('Regra padrão de cache aplicada (behavior=cache, fase=request).');
      }
      const ruleResults = await Promise.all(ruleInputs.map(async (rule) => ensureCacheRule(rule)));
      if (ruleResults.length > 0) {
        await log('info', `Rules processadas: ${ruleResults.length} (novas: ${ruleResults.filter((r) => r.created).length}).`);
      } else {
        notes.push('Nenhuma regra de cache configurada via orquestração.');
      }

      const domainInput: CreateDomainInput = { ...parsed.domain, edgeApplicationId: edgeResult.record.id };
      const domainResult = await ensureDomain(domainInput);
      await log(
        'info',
        domainResult.created ? `Domain criado: ${summarizeRecord(domainResult.record)}` : `Domain reutilizado: ${summarizeRecord(domainResult.record)}`,
      );

      const firewallInput = {
        name: parsed.firewall?.name ?? `${parsed.project}-firewall`,
        domainIds: parsed.firewall?.domainIds ?? [domainResult.record.id],
        domainNames: parsed.firewall?.domainNames,
        isActive: parsed.firewall?.isActive ?? true,
      } satisfies CreateFirewallInput;

      const firewallResult = await ensureFirewall(firewallInput);
      await log(
        'info',
        firewallResult.created ? `Firewall criado: ${summarizeRecord(firewallResult.record)}` : `Firewall reutilizado: ${summarizeRecord(firewallResult.record)}`,
      );

      const wafRulesetInput = {
        name: parsed.wafRuleset?.name ?? `${parsed.project}-waf-ruleset`,
        mode: parsed.wafRuleset?.mode ?? parsed.waf?.mode ?? 'blocking',
        description: parsed.wafRuleset?.description,
      } satisfies CreateWafRulesetInput;

      const wafRulesetResult = await ensureWafRuleset(wafRulesetInput);
      await log(
        'info',
        wafRulesetResult.created
          ? `Ruleset WAF criado: ${summarizeRecord(wafRulesetResult.record)}`
          : `Ruleset WAF reutilizado: ${summarizeRecord(wafRulesetResult.record)}`,
      );

      const firewallRuleInput: ApplyWafRulesetInput = {
        firewallId: firewallResult.record.id,
        rulesetId: wafRulesetResult.record.id,
        order: parsed.firewallRule?.order ?? 0,
      };

      const firewallRuleResult = await ensureFirewallRule(firewallRuleInput);
      await log(
        'info',
        firewallRuleResult.created
          ? `Ruleset ${firewallRuleInput.rulesetId} aplicado ao firewall ${firewallRuleInput.firewallId}.`
          : `Ruleset ${firewallRuleInput.rulesetId} já estava aplicado ao firewall ${firewallRuleInput.firewallId}.`,
      );

      const wafInput = {
        edgeApplicationId: edgeResult.record.id,
        ...(parsed.waf ?? { enable: true, mode: 'blocking' }),
      };
      const wafResult = await ensureWaf(wafInput);
      await log(
        'info',
        wafResult.created
          ? `WAF configurado (modo ${wafResult.record.mode}).`
          : `WAF reutilizado (modo ${wafResult.record.mode}).`,
      );

      let postDeployInfo: OrchestrationReport['postDeploy'] | undefined;
      if (parsed.postDeploy) {
        const postDeployInput: PostDeployCheckInput = { ...parsed.postDeploy };

        const postDeployReport = await executePostDeployCheck(postDeployInput, server, extra);
        const postDeployPath = await persistPostDeployReport(postDeployReport);
        const successCount = postDeployReport.results.filter((r) => r.ok).length;
        postDeployInfo = {
          success: successCount,
          failures: postDeployReport.results.length - successCount,
          successRate: postDeployReport.stats.successRate,
          avgMs: postDeployReport.stats.avgMs,
          minMs: postDeployReport.stats.minMs,
          maxMs: postDeployReport.stats.maxMs,
          reportFile: statePath(postDeployPath),
        };

        await log(
          postDeployInfo.failures > 0 ? 'error' : 'info',
          `Post-deploy check: sucesso=${postDeployInfo.success}/${postDeployInfo.success + postDeployInfo.failures} | avg=${postDeployInfo.avgMs.toFixed(1)}ms`,
        );

        if (postDeployInfo.failures > 0) {
          notes.push('Post-deploy check reportou falhas. Consulte o relatório detalhado.');
        }
      }

      const finishedAt = new Date();
      const report: OrchestrationReport = {
        project: parsed.project,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        bucket: {
          name: bucketResult.record.name,
          id: bucketResult.record.id,
          created: bucketResult.created,
        },
        upload: uploadInfo,
        edgeApplication: {
          id: edgeResult.record.id,
          name: edgeResult.record.name,
          created: edgeResult.created,
        },
        connector: {
          id: connectorResult.record.id,
          name: connectorResult.record.name,
          created: connectorResult.created,
        },
        firewall: {
          id: firewallResult.record.id,
          name: firewallResult.record.name,
          created: firewallResult.created,
        },
        wafRuleset: {
          id: wafRulesetResult.record.id,
          name: wafRulesetResult.record.name,
          mode: wafRulesetResult.record.mode,
          created: wafRulesetResult.created,
        },
        firewallRule: {
          id: firewallRuleResult.record.id,
          order: firewallRuleResult.record.order,
          created: firewallRuleResult.created,
        },
        cacheRules: ruleResults.map((result) => ({
          id: result.record.id,
          phase: result.record.phase,
          order: result.record.order,
          created: result.created,
        })),
        domain: {
          id: domainResult.record.id,
          name: domainResult.record.name,
          created: domainResult.created,
        },
        waf: {
          id: wafResult.record.wafId,
          mode: wafResult.record.mode,
          enabled: wafResult.record.enabled,
          created: wafResult.created,
        },
        postDeploy: postDeployInfo,
        notes,
      };

      const reportPath = await persistReport(report);

      const summaryLines = [
        `Provisionamento concluído para ${parsed.project}`,
        `- Bucket: ${summarizeRecord(bucketResult.record)} (${bucketResult.created ? 'criado' : 'reutilizado'})`,
        `- Edge Application: ${summarizeRecord(edgeResult.record)} (${edgeResult.created ? 'criada' : 'reutilizada'})`,
        `- Connector: ${summarizeRecord(connectorResult.record)} (${connectorResult.created ? 'criado' : 'reutilizado'})`,
        `- Firewall: ${summarizeRecord(firewallResult.record)} (${firewallResult.created ? 'criado' : 'reutilizado'})`,
        `- WAF Ruleset: ${summarizeRecord(wafRulesetResult.record)} (${wafRulesetResult.created ? 'criado' : 'reutilizado'})`,
        `- Firewall Rule: ${firewallRuleResult.record.id} (${firewallRuleResult.created ? 'criada' : 'reutilizada'})`,
        `- Domain: ${summarizeRecord(domainResult.record)} (${domainResult.created ? 'criado' : 'reutilizado'})`,
        `- WAF: ${wafResult.record.mode} | enabled=${wafResult.record.enabled}`,
        `- Rules criadas: ${ruleResults.filter((r) => r.created).length}/${ruleResults.length}`,
        `- Relatório: ${statePath(reportPath)}`,
      ];

      if (uploadInfo) {
        summaryLines.splice(5, 0, `- Upload: enviados=${uploadInfo.executed} | pulados=${uploadInfo.skipped} | log=${uploadInfo.logFile}`);
      }

      if (postDeployInfo) {
        summaryLines.splice(
          summaryLines.length - 1,
          0,
          `- Post-deploy: sucesso=${postDeployInfo.success}/${postDeployInfo.success + postDeployInfo.failures} | avg=${postDeployInfo.avgMs.toFixed(1)}ms | log=${postDeployInfo.reportFile}`,
        );
      }

      if (notes.length > 0) {
        summaryLines.push('', 'Observações:');
        for (const note of notes) {
          summaryLines.push(`- ${note}`);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: summaryLines.join('\n'),
          },
        ],
      };
    },
  );
}
