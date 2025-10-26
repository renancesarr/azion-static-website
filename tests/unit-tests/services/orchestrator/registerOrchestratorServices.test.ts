import { jest } from '@jest/globals';

const buildDryRunPlanMock = jest.fn();
const buildConnectorInputMock = jest.fn();
const buildRuleInputsMock = jest.fn();
const persistReportMock = jest.fn();
const summarizeRecordMock = jest.fn();

const ensureBucketMock = jest.fn();
const processUploadDirMock = jest.fn();

const ensureEdgeApplicationMock = jest.fn();
const ensureEdgeConnectorMock = jest.fn();
const ensureCacheRuleMock = jest.fn();

const ensureDomainMock = jest.fn();

const ensureFirewallMock = jest.fn();
const ensureWafRulesetMock = jest.fn();
const ensureFirewallRuleMock = jest.fn();
const ensureWafMock = jest.fn();

const executePostDeployCheckMock = jest.fn();
const persistPostDeployReportMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/orchestrator/buildDryRunPlan.js', () => ({
  buildDryRunPlan: buildDryRunPlanMock,
}));

jest.unstable_mockModule('../../../../src/services/orchestrator/buildConnectorInput.js', () => ({
  buildConnectorInput: buildConnectorInputMock,
}));

jest.unstable_mockModule('../../../../src/services/orchestrator/buildRuleInputs.js', () => ({
  buildRuleInputs: buildRuleInputsMock,
}));

jest.unstable_mockModule('../../../../src/services/orchestrator/persistReport.js', () => ({
  persistReport: persistReportMock,
}));

jest.unstable_mockModule('../../../../src/services/orchestrator/summarizeRecord.js', () => ({
  summarizeRecord: summarizeRecordMock,
}));

jest.unstable_mockModule('../../../../src/services/storage/index.js', async () => {
  const actual = await jest.requireActual<typeof import('../../../../src/services/storage/index.js')>(
    '../../../../src/services/storage/index.js',
  );
  return {
    ...actual,
    ensureBucket: ensureBucketMock,
    processUploadDir: processUploadDirMock,
  };
});

jest.unstable_mockModule('../../../../src/services/edge/index.js', async () => {
  const actual = await jest.requireActual<typeof import('../../../../src/services/edge/index.js')>(
    '../../../../src/services/edge/index.js',
  );
  return {
    ...actual,
    ensureEdgeApplication: ensureEdgeApplicationMock,
    ensureEdgeConnector: ensureEdgeConnectorMock,
    ensureCacheRule: ensureCacheRuleMock,
  };
});

jest.unstable_mockModule('../../../../src/services/domain/index.js', async () => {
  const actual = await jest.requireActual<typeof import('../../../../src/services/domain/index.js')>(
    '../../../../src/services/domain/index.js',
  );
  return {
    ...actual,
    ensureDomain: ensureDomainMock,
  };
});

jest.unstable_mockModule('../../../../src/services/security/index.js', async () => {
  const actual = await jest.requireActual<typeof import('../../../../src/services/security/index.js')>(
    '../../../../src/services/security/index.js',
  );
  return {
    ...actual,
    ensureFirewall: ensureFirewallMock,
    ensureWafRuleset: ensureWafRulesetMock,
    ensureFirewallRule: ensureFirewallRuleMock,
    ensureWaf: ensureWafMock,
  };
});

jest.unstable_mockModule('../../../../src/services/postDeploy/index.js', async () => {
  const actual = await jest.requireActual<typeof import('../../../../src/services/postDeploy/index.js')>(
    '../../../../src/services/postDeploy/index.js',
  );
  return {
    ...actual,
    executePostDeployCheck: executePostDeployCheckMock,
    persistPostDeployReport: persistPostDeployReportMock,
  };
});

let registerOrchestratorServices: typeof import('../../../../src/services/orchestrator/registerOrchestratorServices.js')['registerOrchestratorServices'];

beforeAll(async () => {
  ({ registerOrchestratorServices } = await import('../../../../src/services/orchestrator/registerOrchestratorServices.js'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

function setupServer() {
  const handlers: Record<string, (args: unknown, extra?: any) => Promise<any>> = {};
  const registerTool = jest.fn((name, _config, handler) => {
    handlers[name] = handler;
  });
  const sendLoggingMessage = jest.fn();
  const server = { registerTool, sendLoggingMessage };
  return { server, handlers, sendLoggingMessage };
}

describe('registerOrchestratorServices', () => {
  const deps = {} as any;

  it('retorna plano quando dryRun ativado', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();
    buildDryRunPlanMock.mockReturnValue(['step-1', 'step-2']);

    registerOrchestratorServices(server as any);

    const response = await handlers['azion.provision_static_site']({
      project: 'site',
      dryRun: true,
      bucket: { name: 'bucket-1' },
      edgeApplication: { name: 'edge-app' },
      connector: { name: 'connector', bucketId: 'bucket-1' },
      domain: { name: 'example.com' },
      firewall: { name: 'fw', domainNames: ['example.com'] },
      wafRuleset: { name: 'ruleset' },
    }, { sessionId: 'session-1' });

    expect(buildDryRunPlanMock).toHaveBeenCalled();
    expect(sendLoggingMessage).toHaveBeenCalledWith({ level: 'info', data: 'Dry-run solicitado — exibindo plano sem executar chamadas.' }, 'session-1');
    expect(response.content[0].text).toBe('step-1\nstep-2');
    expect(ensureBucketMock).not.toHaveBeenCalled();
  });

  it('executa fluxo completo com upload e post-deploy', async () => {
    const { server, handlers, sendLoggingMessage } = setupServer();

    ensureBucketMock.mockResolvedValue({ created: true, record: { id: 'bucket-1', name: 'bucket-1' } });
    processUploadDirMock.mockResolvedValue({
      report: {
        totals: { toUpload: 1, uploaded: 1, skipped: 0, failed: 0, scanned: 1 },
        dryRun: false,
      },
      summaryLines: ['upload summary'],
      logFilePath: '.mcp-state/storage/uploads/logs/upload.json',
    });
    ensureEdgeApplicationMock.mockResolvedValue({ created: true, record: { id: 'edge-1', name: 'edge-app' } });
    buildConnectorInputMock.mockReturnValue({ name: 'connector', bucketId: 'bucket-1', bucketName: 'bucket-1' });
    ensureEdgeConnectorMock.mockResolvedValue({ created: true, record: { id: 'conn-1', name: 'connector' } });
    buildRuleInputsMock.mockReturnValue([{ edgeApplicationId: 'edge-1', phase: 'request', order: 0 }]);
    ensureCacheRuleMock.mockResolvedValue({ created: true, record: { id: 'rule-1', phase: 'request', order: 0 } });
    ensureDomainMock.mockResolvedValue({ created: true, record: { id: 'domain-1', name: 'example.com' } });
    ensureFirewallMock.mockResolvedValue({ created: true, record: { id: 'firewall-1', name: 'fw' } });
    ensureWafRulesetMock.mockResolvedValue({ created: true, record: { id: 'ruleset-1', name: 'ruleset', mode: 'blocking' } });
    ensureFirewallRuleMock.mockResolvedValue({ created: true, record: { id: 'binding-1', order: 0 } });
    ensureWafMock.mockResolvedValue({ created: true, record: { wafId: 'waf-1', mode: 'blocking', enabled: true } });
    executePostDeployCheckMock.mockResolvedValue({
      results: [{ ok: true, url: 'https://example.com' }],
      stats: { successRate: 1, avgMs: 120, minMs: 120, maxMs: 120 },
    });
    persistPostDeployReportMock.mockResolvedValue('post-deploy/report.json');
    persistReportMock.mockResolvedValue('orchestration/runs/report.json');
    summarizeRecordMock.mockImplementation((record) => `${record.name ?? record.id}`);

    registerOrchestratorServices(server as any);

    const response = await handlers['azion.provision_static_site']({
      project: 'site',
      bucket: { name: 'bucket-1' },
      upload: { localDir: './dist' },
      edgeApplication: { name: 'edge-app' },
      connector: { name: 'connector' },
      cacheRules: [],
      domain: { name: 'example.com' },
      firewall: { name: 'fw', domainNames: ['example.com'] },
      wafRuleset: { name: 'ruleset' },
      waf: { mode: 'blocking' },
      postDeploy: { domain: 'example.com', paths: ['/'] },
    }, { sessionId: 'session-2' });

    expect(ensureBucketMock).toHaveBeenCalled();
    expect(processUploadDirMock).toHaveBeenCalled();
    expect(ensureEdgeApplicationMock).toHaveBeenCalled();
    expect(ensureEdgeConnectorMock).toHaveBeenCalled();
    expect(ensureCacheRuleMock).toHaveBeenCalled();
    expect(ensureDomainMock).toHaveBeenCalled();
    expect(ensureFirewallMock).toHaveBeenCalled();
    expect(ensureWafRulesetMock).toHaveBeenCalled();
    expect(ensureFirewallRuleMock).toHaveBeenCalled();
    expect(ensureWafMock).toHaveBeenCalled();
    expect(executePostDeployCheckMock).toHaveBeenCalled();
    expect(persistReportMock).toHaveBeenCalled();
    expect(sendLoggingMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.stringContaining('Bucket') }),
      'session-2',
    );
    expect(response.content[0].text).toContain('Provisionamento concluído');
    expect(response.content[0].text).toContain('Post-deploy: sucesso=1/1');
  });
});
