import { jest } from '@jest/globals';
import { OrchestrationReport } from '../../../../src/models/entities/orchestrationReport.js';

const writeStateFileMock = jest.fn();

jest.unstable_mockModule('../../../../src/utils/state.js', () => ({
  writeStateFile: writeStateFileMock,
  statePath: (value: string) => value,
}));

type DryRunModule = typeof import('../../../../src/services/orchestrator/buildDryRunPlan.js');
type ConnectorModule = typeof import('../../../../src/services/orchestrator/buildConnectorInput.js');
type RuleModule = typeof import('../../../../src/services/orchestrator/buildRuleInputs.js');
type SummaryModule = typeof import('../../../../src/services/orchestrator/summarizeRecord.js');
type PersistModule = typeof import('../../../../src/services/orchestrator/persistReport.js');

let buildDryRunPlan: DryRunModule['buildDryRunPlan'];
let buildConnectorInput: ConnectorModule['buildConnectorInput'];
let buildRuleInputs: RuleModule['buildRuleInputs'];
let summarizeRecord: SummaryModule['summarizeRecord'];
let persistReport: PersistModule['persistReport'];

beforeAll(async () => {
  ({ buildDryRunPlan } = await import('../../../../src/services/orchestrator/buildDryRunPlan.js'));
  ({ buildConnectorInput } = await import('../../../../src/services/orchestrator/buildConnectorInput.js'));
  ({ buildRuleInputs } = await import('../../../../src/services/orchestrator/buildRuleInputs.js'));
  ({ summarizeRecord } = await import('../../../../src/services/orchestrator/summarizeRecord.js'));
  ({ persistReport } = await import('../../../../src/services/orchestrator/persistReport.js'));
});

beforeEach(() => {
  writeStateFileMock.mockReset();
});

describe('orchestrator helpers', () => {
  it('gera plano de dry-run com upload configurado', () => {
    const plan = buildDryRunPlan({
      project: 'site',
      bucket: { name: 'bucket' },
      upload: { localDir: './dist', dryRun: true },
      edgeApplication: { name: 'edge' },
      connector: { name: 'connector' },
      domain: { name: 'example.com' },
    } as any);

    expect(plan[0]).toContain('site');
    expect(plan).toContain('2. azion.upload_dir (localDir=./dist, dryRun=true)');
    expect(plan).toContain('8. (post-deploy opcional não configurado)');
  });

  it('monta entrada de connector com fallback para bucket resolvido', () => {
    const input = buildConnectorInput(
      { name: 'connector', originPath: '/public' },
      { id: 'bucket-1', name: 'bucket-name' },
    );

    expect(input).toEqual({
      name: 'connector',
      originPath: '/public',
      bucketId: 'bucket-1',
      bucketName: 'bucket-name',
    });
  });

  it('gera regra padrão quando lista vazia', () => {
    const rules = buildRuleInputs([], 'edge-1');

    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatchObject({
      edgeApplicationId: 'edge-1',
      behaviors: [{ name: 'cache' }],
      criteria: [],
      description: 'default-cache-static',
      order: 0,
    });
  });

  it('propaga configurações customizadas de cache rule', () => {
    const rules = buildRuleInputs(
      [
        {
          phase: 'response',
          behaviors: [{ name: 'deliver' }],
          criteria: [{ name: 'path', arguments: ['/assets/*'] }],
          description: 'assets',
          order: 3,
        },
      ],
      'edge-2',
    );

    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatchObject({
      edgeApplicationId: 'edge-2',
      phase: 'response',
      behaviors: [{ name: 'deliver' }],
      criteria: [{ name: 'path', arguments: ['/assets/*'] }],
      description: 'assets',
      order: 3,
    });
  });

  it('produz resumo com nome quando disponível', () => {
    expect(summarizeRecord({ id: '1', name: 'item' })).toBe('item (1)');
    expect(summarizeRecord({ id: '2' })).toBe('2');
  });

  it('persiste relatório normalizando timestamp', async () => {
    const report = OrchestrationReport.create({
      project: 'proj',
      startedAt: '2025-01-13T10:20:00.000Z',
      finishedAt: '2025-01-13T10:20:30.123Z',
      bucket: { id: 'bucket-1', name: 'bucket', created: true },
      edgeApplication: { id: 'edge-1', name: 'edge', created: true },
      connector: { id: 'conn-1', name: 'connector', created: true },
      cacheRules: [],
      domain: { id: 'domain-1', name: 'example.com', created: true },
      waf: { id: 'waf-1', mode: 'blocking', enabled: true, created: true },
      firewall: { id: 'firewall-1', name: 'fw', created: true },
      wafRuleset: { id: 'ruleset-1', name: 'ruleset', mode: 'blocking', created: true },
      firewallRule: { id: 'binding-1', order: 0, created: true },
      notes: [],
    });

    const relativePath = await persistReport(report);

    expect(relativePath).toBe('orchestration/runs/provision-2025-01-13T10-20-30-123Z.json');
    expect(writeStateFileMock).toHaveBeenCalledWith(
      'orchestration/runs/provision-2025-01-13T10-20-30-123Z.json',
      report.toJSON(),
    );
  });
});
