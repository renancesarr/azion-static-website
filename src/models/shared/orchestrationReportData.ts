export interface OrchestrationComponentSummary {
  id: string;
  name: string;
  created: boolean;
}

export interface OrchestrationUploadSummary {
  planned: number;
  executed: number;
  skipped: number;
  logFile: string;
}

export interface OrchestrationCacheRuleSummary {
  id: string;
  phase: string;
  order: number;
  created: boolean;
}

export interface OrchestrationWafSummary {
  id: string;
  mode: string;
  enabled: boolean;
  created: boolean;
}

export interface OrchestrationFirewallRuleSummary {
  id: string;
  order: number;
  created: boolean;
}

export interface OrchestrationPostDeploySummary {
  success: number;
  failures: number;
  successRate: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  reportFile: string;
}

export interface OrchestrationReportData {
  project: string;
  startedAt: string;
  finishedAt: string;
  bucket: OrchestrationComponentSummary;
  upload?: OrchestrationUploadSummary;
  edgeApplication: OrchestrationComponentSummary;
  connector: OrchestrationComponentSummary;
  cacheRules: OrchestrationCacheRuleSummary[];
  domain: OrchestrationComponentSummary;
  waf: OrchestrationWafSummary;
  firewall: OrchestrationComponentSummary;
  wafRuleset: OrchestrationComponentSummary & { mode: string };
  firewallRule: OrchestrationFirewallRuleSummary;
  postDeploy?: OrchestrationPostDeploySummary;
  notes: string[];
}
