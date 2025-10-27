import type { UploadIndexFileData } from '../../models/shared/uploadIndexFileData.js';
import { StackValidationReport } from '../../models/entities/stackValidationReport.js';
import { ValidationCheckResult } from '../../models/entities/validationCheckResult.js';
import { UploadIndexFile } from '../../models/entities/uploadIndexFile.js';
import { STACK_STATE } from './constants.js';
import {
  stackValidateInputSchema,
  type StackValidateInput,
} from './schemas.js';
import { readState, summarizeState, listIds } from './stateUtils.js';
import { defaultValidationDependencies } from './dependencies.js';
import type { ValidationDependencies } from './types.js';
import { HttpError } from '../../utils/http.js';

async function summarizeGzipAssets(
  deps: ValidationDependencies,
): Promise<
  { check: ValidationCheckResult; assets: string[] }
  | undefined
> {
  const bucketState = await readState<{ buckets: Record<string, { id: string }> }>(deps.state, STACK_STATE.bucket);
  const bucketIds = bucketState ? Object.values(bucketState.buckets ?? {}).map((b) => b.id) : [];
  if (bucketIds.length === 0) {
    return undefined;
  }

  const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '_');
  const indexPath = `storage/uploads/index-${sanitize(bucketIds[0])}.json`;
  const uploadIndexData = await readState<UploadIndexFileData>(deps.state, indexPath);
  if (!uploadIndexData) {
    return undefined;
  }
  const uploadIndex = UploadIndexFile.hydrate(uploadIndexData);

  const gzipAssets = Object.values(uploadIndex.files ?? {})
    .filter((entry) => entry.contentEncoding === 'gzip')
    .map((entry) => `${entry.objectPath} <= ${entry.sourcePath ?? 'n/d'}`);

  return {
    check: summarizeState(
      'Gzip Assets',
      gzipAssets.length > 0,
      gzipAssets.length > 0 ? gzipAssets.join(', ') : 'Nenhum objeto com encoding gzip registrado.',
    ),
    assets: gzipAssets,
  };
}

export async function runStackValidation(
  args: unknown,
  deps: ValidationDependencies = defaultValidationDependencies,
): Promise<StackValidationReport> {
  const input = stackValidateInputSchema.parse(args ?? {});
  const startedAt = new Date();
  const checks: ValidationCheckResult[] = [];

  const bucketState = await readState<{ buckets: Record<string, { id: string }> }>(deps.state, STACK_STATE.bucket);
  checks.push(
    summarizeState(
      'Bucket',
      !!bucketState && Object.keys(bucketState.buckets ?? {}).length > 0,
      bucketState ? `IDs: ${listIds(bucketState.buckets)}` : 'Arquivo não encontrado.',
    ),
  );

  const edgeAppState = await readState<{ applications: Record<string, { id: string }> }>(deps.state, STACK_STATE.edgeApp);
  checks.push(
    summarizeState(
      'Edge Application',
      !!edgeAppState && Object.keys(edgeAppState.applications ?? {}).length > 0,
      edgeAppState ? `IDs: ${listIds(edgeAppState.applications)}` : 'Arquivo não encontrado.',
    ),
  );

  const connectorState = await readState<{ connectors: Record<string, { id: string }> }>(deps.state, STACK_STATE.connector);
  checks.push(
    summarizeState(
      'Edge Connector',
      !!connectorState && Object.keys(connectorState.connectors ?? {}).length > 0,
      connectorState ? `IDs: ${listIds(connectorState.connectors)}` : 'Arquivo não encontrado.',
    ),
  );

  const cacheState = await readState<{ rules: Record<string, { id: string }> }>(deps.state, STACK_STATE.cacheRule);
  checks.push(
    summarizeState(
      'Cache Rule',
      !!cacheState && Object.keys(cacheState.rules ?? {}).length > 0,
      cacheState ? `IDs: ${listIds(cacheState.rules)}` : 'Arquivo não encontrado.',
    ),
  );

  const domainState = await readState<{ domains: Record<string, { id: string; name?: string }> }>(deps.state, STACK_STATE.domain);
  const domainNames = domainState ? Object.keys(domainState.domains ?? {}) : [];
  checks.push(
    summarizeState(
      'Domain',
      !!domainState && domainNames.length > 0,
      domainState ? `Domínios: ${domainNames.join(', ')}` : 'Arquivo não encontrado.',
    ),
  );

  const firewallState = await readState<{ firewalls: Record<string, { id: string }> }>(deps.state, STACK_STATE.firewall);
  checks.push(
    summarizeState(
      'Firewall',
      !!firewallState && Object.keys(firewallState.firewalls ?? {}).length > 0,
      firewallState ? `IDs: ${listIds(firewallState.firewalls)}` : 'Arquivo não encontrado.',
    ),
  );

  const rulesetState = await readState<{ rulesets: Record<string, { id: string }> }>(deps.state, STACK_STATE.wafRuleset);
  checks.push(
    summarizeState(
      'WAF Ruleset',
      !!rulesetState && Object.keys(rulesetState.rulesets ?? {}).length > 0,
      rulesetState ? `IDs: ${listIds(rulesetState.rulesets)}` : 'Arquivo não encontrado.',
    ),
  );

  const firewallRuleState = await readState<{ bindings: Record<string, { id: string }> }>(deps.state, STACK_STATE.firewallRule);
  checks.push(
    summarizeState(
      'Firewall Rule',
      !!firewallRuleState && Object.keys(firewallRuleState.bindings ?? {}).length > 0,
      firewallRuleState ? `IDs: ${listIds(firewallRuleState.bindings)}` : 'Arquivo não encontrado.',
    ),
  );

  const gzipResult = await summarizeGzipAssets(deps);
  if (gzipResult) {
    checks.push(gzipResult.check);
  }

  let httpResult: StackValidationReport['http'];
  const domainToTest = input.domain ?? domainNames[0];
  if (domainToTest) {
    const url = `${input.protocol}://${domainToTest}${input.path}`;
    const controller = new AbortController();
    const timer = deps.setTimeout(() => controller.abort(), input.timeoutMs);
    const start = deps.clock.now();
    try {
      const response = await deps.http.request<string>({ method: 'GET', url, signal: controller.signal });
      const duration = deps.clock.now() - start;
      httpResult = {
        url,
        status: response.status,
        ok: true,
        durationMs: duration,
        error: undefined,
      };
      deps.logger.info(`${url} -> ${response.status} (${duration.toFixed(1)}ms)`);
    } catch (error) {
      const duration = deps.clock.now() - start;
      const message = error instanceof HttpError ? error.message : error instanceof Error ? error.message : String(error);
      httpResult = {
        url,
        ok: false,
        durationMs: duration,
        error: message,
      };
      deps.logger.error(`${url} falhou: ${message}`);
    } finally {
      deps.clearTimeout(timer);
    }
  }

  const finishedAt = new Date();
  return StackValidationReport.create({
    project: input.project,
    domain: domainToTest,
    protocol: input.protocol,
    path: input.path,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    checks: checks.map((check) => check.toJSON()),
    http: httpResult,
    gzipAssets: gzipResult?.assets,
  });
}
