import type {
  OrchestrationCacheRuleSummary,
  OrchestrationComponentSummary,
  OrchestrationFirewallRuleSummary,
  OrchestrationPostDeploySummary,
  OrchestrationReportData,
  OrchestrationUploadSummary,
  OrchestrationWafSummary,
} from '../shared/orchestrationReportData.js';

function cloneComponent(component: OrchestrationComponentSummary): OrchestrationComponentSummary {
  return {
    id: component.id,
    name: component.name,
    created: component.created,
  };
}

function cloneCacheRule(rule: OrchestrationCacheRuleSummary): OrchestrationCacheRuleSummary {
  return {
    id: rule.id,
    phase: rule.phase,
    order: rule.order,
    created: rule.created,
  };
}

function cloneUpload(upload?: OrchestrationUploadSummary): OrchestrationUploadSummary | undefined {
  if (!upload) {
    return undefined;
  }
  return {
    planned: upload.planned,
    executed: upload.executed,
    skipped: upload.skipped,
    logFile: upload.logFile,
  };
}

function cloneWaf(waf: OrchestrationWafSummary): OrchestrationWafSummary {
  return {
    id: waf.id,
    mode: waf.mode,
    enabled: waf.enabled,
    created: waf.created,
  };
}

function cloneFirewallRule(rule: OrchestrationFirewallRuleSummary): OrchestrationFirewallRuleSummary {
  return {
    id: rule.id,
    order: rule.order,
    created: rule.created,
  };
}

function clonePostDeploy(postDeploy?: OrchestrationPostDeploySummary): OrchestrationPostDeploySummary | undefined {
  if (!postDeploy) {
    return undefined;
  }
  return {
    success: postDeploy.success,
    failures: postDeploy.failures,
    successRate: postDeploy.successRate,
    avgMs: postDeploy.avgMs,
    minMs: postDeploy.minMs,
    maxMs: postDeploy.maxMs,
    reportFile: postDeploy.reportFile,
  };
}

export class OrchestrationReport {
  readonly project: string;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly bucket: OrchestrationComponentSummary;
  readonly upload?: OrchestrationUploadSummary;
  readonly edgeApplication: OrchestrationComponentSummary;
  readonly connector: OrchestrationComponentSummary;
  readonly cacheRules: OrchestrationCacheRuleSummary[];
  readonly domain: OrchestrationComponentSummary;
  readonly waf: OrchestrationWafSummary;
  readonly firewall: OrchestrationComponentSummary;
  readonly wafRuleset: OrchestrationComponentSummary & { mode: string };
  readonly firewallRule: OrchestrationFirewallRuleSummary;
  readonly postDeploy?: OrchestrationPostDeploySummary;
  readonly notes: string[];

  private constructor(data: OrchestrationReportData) {
    this.project = data.project;
    this.startedAt = data.startedAt;
    this.finishedAt = data.finishedAt;
    this.bucket = cloneComponent(data.bucket);
    this.upload = cloneUpload(data.upload);
    this.edgeApplication = cloneComponent(data.edgeApplication);
    this.connector = cloneComponent(data.connector);
    this.cacheRules = data.cacheRules.map(cloneCacheRule);
    this.domain = cloneComponent(data.domain);
    this.waf = cloneWaf(data.waf);
    this.firewall = cloneComponent(data.firewall);
    this.wafRuleset = {
      ...cloneComponent(data.wafRuleset),
      mode: data.wafRuleset.mode,
    };
    this.firewallRule = cloneFirewallRule(data.firewallRule);
    this.postDeploy = clonePostDeploy(data.postDeploy);
    this.notes = [...data.notes];
  }

  static create(data: OrchestrationReportData): OrchestrationReport {
    return new OrchestrationReport({
      ...data,
      cacheRules: data.cacheRules ?? [],
      notes: data.notes ?? [],
    });
  }

  static hydrate(data: OrchestrationReportData): OrchestrationReport {
    return OrchestrationReport.create(data);
  }

  toJSON(): OrchestrationReportData {
    return {
      project: this.project,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      bucket: cloneComponent(this.bucket),
      upload: cloneUpload(this.upload),
      edgeApplication: cloneComponent(this.edgeApplication),
      connector: cloneComponent(this.connector),
      cacheRules: this.cacheRules.map(cloneCacheRule),
      domain: cloneComponent(this.domain),
      waf: cloneWaf(this.waf),
      firewall: cloneComponent(this.firewall),
      wafRuleset: {
        ...cloneComponent(this.wafRuleset),
        mode: this.wafRuleset.mode,
      },
      firewallRule: cloneFirewallRule(this.firewallRule),
      postDeploy: clonePostDeploy(this.postDeploy),
      notes: [...this.notes],
    };
  }
}
