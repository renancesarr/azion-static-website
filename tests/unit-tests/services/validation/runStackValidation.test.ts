import { jest } from '@jest/globals';
import { runStackValidation } from '../../../../src/services/validation/runStackValidation.js';

describe('runStackValidation', () => {
  const stateData: Record<string, any> = {
    'storage/storage_buckets.json': { buckets: { bucket: { id: 'bucket-1' } } },
    'edge/edge_applications.json': { applications: { app: { id: 'edge-1' } } },
    'edge/edge_connectors.json': { connectors: { connector: { id: 'conn-1' } } },
    'edge/rules_engine.json': { rules: { rule: { id: 'rule-1' } } },
    'edge/domains.json': { domains: { 'example.com': { id: 'domain-1' } } },
    'security/firewalls.json': { firewalls: { firewall: { id: 'fw-1' } } },
    'security/waf_rulesets.json': { rulesets: { ruleset: { id: 'ruleset-1' } } },
    'security/firewall_rules.json': { bindings: { binding: { id: 'binding-1' } } },
    'storage/uploads/index-bucket-1.json': {
      files: {
        'file.gz': { objectPath: 'file.gz', sourcePath: 'src/file.gz', contentEncoding: 'gzip' },
      },
    },
  };

  const state = {
    read: jest.fn((path: string) => Promise.resolve(stateData[path])),
  };

  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };

  let timeStamps: number[] = [];
  const deps = {
    state,
    logger,
    clock: { now: () => timeStamps.shift() ?? 0 },
    http: {
      request: jest.fn().mockResolvedValue({ status: 200, data: 'ok' }),
    },
    setTimeout: jest.fn((handler) => {
      handler();
      return 1 as any;
    }),
    clearTimeout: jest.fn(),
  } as any;

  it('gera relatório com checks e resultado HTTP', async () => {
    timeStamps = [0, 100];
    const report = await runStackValidation({ project: 'site', domain: 'example.com', path: '/', timeoutMs: 1000 }, deps);

    expect(report.project).toBe('site');
    expect(report.checks.length).toBeGreaterThanOrEqual(8);
    expect(report.http?.ok).toBe(true);
    expect(report.gzipAssets).toEqual(['file.gz <= src/file.gz']);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('https://example.com/'));
  });

  it('registra falha HTTP quando requisição falha', async () => {
    timeStamps = [0, 100];
    const failingDeps = {
      ...deps,
      clock: { now: () => 0 },
      http: {
        request: jest.fn().mockRejectedValue(new Error('offline')),
      },
      setTimeout: jest.fn(() => 1 as any),
    };

    const report = await runStackValidation({ domain: 'example.com', timeoutMs: 1000 }, failingDeps);
    expect(report.http?.ok).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('offline'));
  });
});
