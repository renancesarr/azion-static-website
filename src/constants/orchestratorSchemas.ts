import { z } from 'zod';
import { createBucketSchema, uploadDirSchema } from './storageSchemas.js';
import { createEdgeApplicationSchema, createConnectorSchema, createRuleSchema } from './edgeSchemas.js';
import { configureWafSchema, createWafRulesetSchema, applyWafRulesetSchema } from './securitySchemas.js';
import { postDeployCheckSchema } from './postDeploySchemas.js';

const domainOverrideSchema = z.object({
  name: z.string().min(3),
  isActive: z.boolean().optional(),
  cname: z.string().optional(),
});

const firewallOverrideSchema = z.object({
  name: z.string().min(3).max(128).optional(),
  domainIds: z.array(z.string()).optional(),
  domainNames: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const connectorOrchestratorSchema = z.object({
  name: z.string().min(3),
  originPath: z.string().optional(),
  bucketId: z.string().optional(),
  bucketName: z.string().optional(),
});

export const cacheRuleOrchestratorSchema = z.object({
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
  order: z.number().int().min(0).optional(),
});

export const uploadConfigSchema = z.object({
  localDir: z.string().min(1),
  prefix: z.string().optional(),
  concurrency: z.number().int().min(1).max(32).optional(),
  dryRun: z.boolean().optional(),
  stripGzipExtension: z.boolean().optional(),
});

export const orchestrateSchema = z.object({
  project: z.string().min(1),
  bucket: createBucketSchema,
  upload: uploadDirSchema.optional(),
  edgeApplication: createEdgeApplicationSchema,
  connector: connectorOrchestratorSchema,
  cacheRules: z.array(cacheRuleOrchestratorSchema).default([]),
  domain: domainOverrideSchema,
  waf: configureWafSchema.partial(),
  firewall: firewallOverrideSchema,
  wafRuleset: createWafRulesetSchema.partial(),
  firewallRule: applyWafRulesetSchema.pick({ order: true }).partial(),
  postDeploy: postDeployCheckSchema.optional(),
  dryRun: z.boolean().default(false),
});
