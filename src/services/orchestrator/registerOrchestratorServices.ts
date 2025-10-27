import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
import { ToolExecutionContext } from '../../models/shared/toolExecutionContext.js';
import { ToolResponse } from '../../models/shared/toolResponse.js';
import { UploadExecution } from '../../models/shared/uploadExecutionData.js';
import { OrchestrationReport } from '../../models/entities/orchestrationReport.js';
import type {
  OrchestrationPostDeploySummary,
  OrchestrationReportData,
  OrchestrationUploadSummary,
} from '../../models/shared/orchestrationReportData.js';
import {
  orchestrateInputSchema,
  type OrchestrateInput,
  type ConnectorConfig,
  type CacheRuleConfig,
} from './schemas.js';
import { buildDryRunPlan } from './buildDryRunPlan.js';
import { buildConnectorInput } from './buildConnectorInput.js';
import { buildRuleInputs } from './buildRuleInputs.js';
import { persistReport } from './persistReport.js';
import { summarizeRecord } from './summarizeRecord.js';
import {
  createBucketInputSchema,
  ensureBucket,
  uploadDirInputSchema,
  processUploadDir,
  type CreateBucketInput,
  type UploadDirInput,
} from '../storage/index.js';
import {
  createEdgeApplicationInputSchema,
  ensureEdgeApplication,
  ensureEdgeConnector,
  ensureCacheRule,
  type CreateEdgeAppInput,
} from '../edge/index.js';
import { createDomainInputSchema, ensureDomain, type CreateDomainInput } from '../domain/index.js';
import {
  configureWafInputSchema,
  ensureWaf,
  ensureFirewall,
  ensureWafRuleset,
  ensureFirewallRule,
  createFirewallInputSchema,
  createWafRulesetInputSchema,
  applyWafRulesetInputSchema,
  type ConfigureWafInput,
  type CreateFirewallInput,
  type CreateWafRulesetInput,
  type ApplyWafRulesetInput,
} from '../security/index.js';
import {
  executePostDeployCheck,
  persistPostDeployReport,
  type PostDeployCheckInput,
} from '../postDeploy/index.js';
import { statePath } from '../../utils/state.js';

export function registerOrchestratorServices(server: McpServer): void {
  server.registerTool(
    'azion.provision_static_site',
    {
      title: 'Provisionar site estático (orquestração completa)',
      description:
        'Executa o fluxo completo: bucket → edge application → connector → rules → domain → WAF. Upload (opcional) é executado se configurado.',
      inputSchema: orchestrateInputSchema,
    },
    async (args: unknown, extra: ToolExecutionContext = {}): Promise<ToolResponse> => {
      const parsed = orchestrateInputSchema.parse(args ?? {}) as OrchestrateInput;
      const sessionId = extra.sessionId;

      const log = async (level: 'info' | 'error', data: string) => {
        await server.sendLoggingMessage({ level, data }, sessionId);
      };

      if (parsed.dryRun) {
        const plan = buildDryRunPlan(parsed);
        await log('info', 'Dry-run solicitado — exibindo plano sem executar chamadas.');
        return {
          content: [
            {
              type: 'text',
              text: plan.join('\n'),
            },
          ],
        };
      }

      const startedAt = new Date();
      await log('info', `Iniciando provisionamento do projeto ${parsed.project}.`);

      const bucketInput = createBucketInputSchema.parse(parsed.bucket ?? {}) as CreateBucketInput;
      const bucketResult = await ensureBucket(bucketInput);
      await log(
        'info',
        bucketResult.created
          ? `Bucket criado: ${summarizeRecord(bucketResult.record)}`
          : `Bucket reutilizado: ${summarizeRecord(bucketResult.record)}`,
      );

      let uploadInfo: OrchestrationUploadSummary | undefined;
      const uploadConfig = parsed.upload;
      const notes: string[] = [];

      if (uploadConfig) {
        const uploadInput = uploadDirInputSchema.parse({
          bucketId: bucketResult.record.id,
          bucketName: bucketResult.record.name,
          localDir: uploadConfig.localDir,
          prefix: uploadConfig.prefix,
          concurrency: uploadConfig.concurrency,
          dryRun: uploadConfig.dryRun ?? false,
          stripGzipExtension: uploadConfig.stripGzipExtension ?? false,
        }) as UploadDirInput;

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

      const edgeApplicationInput = createEdgeApplicationInputSchema.parse(parsed.edgeApplication ?? {}) as CreateEdgeAppInput;
      const edgeResult = await ensureEdgeApplication(edgeApplicationInput);
      await log(
        'info',
        edgeResult.created
          ? `Edge Application criada: ${summarizeRecord(edgeResult.record)}`
          : `Edge Application reutilizada: ${summarizeRecord(edgeResult.record)}`,
      );

      const connectorInput = buildConnectorInput(parsed.connector as ConnectorConfig, {
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

      const ruleConfigs = (parsed.cacheRules as CacheRuleConfig[]) ?? [];
      const ruleInputs = buildRuleInputs(ruleConfigs, edgeResult.record.id);
      if (ruleConfigs.length === 0) {
        notes.push('Regra padrão de cache aplicada (behavior=cache, fase=request).');
      }
      const ruleResults = await Promise.all(ruleInputs.map(async (rule) => ensureCacheRule(rule)));
      if (ruleResults.length > 0) {
        await log('info', `Rules processadas: ${ruleResults.length} (novas: ${ruleResults.filter((r) => r.created).length}).`);
      } else {
        notes.push('Nenhuma regra de cache configurada via orquestração.');
      }

      const domainInput = createDomainInputSchema.parse({
        ...parsed.domain,
        edgeApplicationId: edgeResult.record.id,
        isActive: parsed.domain?.isActive ?? true,
      }) as CreateDomainInput;
      const domainResult = await ensureDomain(domainInput);
      await log(
        'info',
        domainResult.created
          ? `Domain criado: ${summarizeRecord(domainResult.record)}`
          : `Domain reutilizado: ${summarizeRecord(domainResult.record)}`,
      );

      const firewallInput = createFirewallInputSchema.parse(parsed.firewall ?? {}) as CreateFirewallInput;
      const firewallResult = await ensureFirewall(firewallInput);
      await log(
        'info',
        firewallResult.created
          ? `Firewall criado: ${summarizeRecord(firewallResult.record)}`
          : `Firewall reutilizado: ${summarizeRecord(firewallResult.record)}`,
      );

      const wafRulesetInput = createWafRulesetInputSchema.parse(parsed.wafRuleset ?? {}) as CreateWafRulesetInput;
      const wafRulesetResult = await ensureWafRuleset(wafRulesetInput);
      await log(
        'info',
        wafRulesetResult.created
          ? `Ruleset WAF criado: ${summarizeRecord(wafRulesetResult.record)}`
          : `Ruleset WAF reutilizado: ${summarizeRecord(wafRulesetResult.record)}`,
      );

      const firewallRuleInput = applyWafRulesetInputSchema.parse({
        firewallId: firewallResult.record.id,
        rulesetId: wafRulesetResult.record.id,
        order: parsed.firewallRule?.order ?? 0,
      }) as ApplyWafRulesetInput;
      const firewallRuleResult = await ensureFirewallRule(firewallRuleInput);
      await log(
        'info',
        firewallRuleResult.created
          ? `Ruleset ${firewallRuleInput.rulesetId} aplicado ao firewall ${firewallRuleInput.firewallId}.`
          : `Ruleset ${firewallRuleInput.rulesetId} já estava aplicado ao firewall ${firewallRuleInput.firewallId}.`,
      );

      const wafConfig = configureWafInputSchema.parse({
        edgeApplicationId: edgeResult.record.id,
        enable: parsed.waf?.enable ?? true,
        mode: parsed.waf?.mode ?? 'blocking',
        wafId: parsed.waf?.wafId,
      }) as ConfigureWafInput;
      const wafResult = await ensureWaf(wafConfig);
      await log(
        'info',
        wafResult.created
          ? `WAF configurado (modo ${wafResult.record.mode}).`
          : `WAF reutilizado (modo ${wafResult.record.mode}).`,
      );

      let postDeployInfo: OrchestrationPostDeploySummary | undefined;
      if (parsed.postDeploy) {
        const postDeployInput: PostDeployCheckInput = {
          ...parsed.postDeploy,
          domain: parsed.postDeploy.domain ?? domainResult.record.name,
        };

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
      const reportData: OrchestrationReportData = {
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
        postDeploy: postDeployInfo,
        notes,
      };

      const report = OrchestrationReport.create(reportData);
      const reportPath = await persistReport(report);

      const summaryLines = [
        `Provisionamento concluído para ${report.project}`,
        `- Bucket: ${summarizeRecord(bucketResult.record)} (${report.bucket.created ? 'criado' : 'reutilizado'})`,
        `- Edge Application: ${summarizeRecord(edgeResult.record)} (${report.edgeApplication.created ? 'criada' : 'reutilizada'})`,
        `- Connector: ${summarizeRecord(connectorResult.record)} (${report.connector.created ? 'criado' : 'reutilizado'})`,
        `- Firewall: ${summarizeRecord(firewallResult.record)} (${report.firewall.created ? 'criado' : 'reutilizado'})`,
        `- WAF Ruleset: ${summarizeRecord(wafRulesetResult.record)} (${report.wafRuleset.created ? 'criado' : 'reutilizado'})`,
        `- Firewall Rule: ${report.firewallRule.id} (${report.firewallRule.created ? 'criada' : 'reutilizada'})`,
        `- Domain: ${summarizeRecord(domainResult.record)} (${report.domain.created ? 'criado' : 'reutilizado'})`,
        `- WAF: ${report.waf.mode} | enabled=${report.waf.enabled}`,
        `- Rules criadas: ${report.cacheRules.filter((rule) => rule.created).length}/${report.cacheRules.length}`,
        `- Relatório: ${statePath(reportPath)}`,
      ];

      const uploadSummary = report.upload;
      if (uploadSummary) {
        summaryLines.splice(
          5,
          0,
          `- Upload: enviados=${uploadSummary.executed} | pulados=${uploadSummary.skipped} | log=${uploadSummary.logFile}`,
        );
      }

      const postDeploySummary = report.postDeploy;
      if (postDeploySummary) {
        summaryLines.splice(
          summaryLines.length - 1,
          0,
          `- Post-deploy: sucesso=${postDeploySummary.success}/${postDeploySummary.success + postDeploySummary.failures} | avg=${postDeploySummary.avgMs.toFixed(1)}ms | log=${postDeploySummary.reportFile}`,
        );
      }

      summaryLines.push('', 'Próximos passos: atualizar DNS do domínio provisionado e acompanhar desempenho inicial.');

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
