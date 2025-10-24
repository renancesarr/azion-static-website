export interface OrchestrationReport {
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
