import { z } from 'zod';

export const configureWafSchema = z.object({
  edgeApplicationId: z.string().min(1),
  wafId: z.string().optional(),
  enable: z.boolean().default(true),
  mode: z.enum(['learning', 'blocking']).default('blocking'),
});

export const wafStatusSchema = z.object({
  edgeApplicationId: z.string().min(1),
});

export const createFirewallSchema = z
  .object({
    name: z.string().min(3).max(128),
    domainIds: z.array(z.string()).optional(),
    domainNames: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => (value.domainIds?.length ?? 0) > 0 || (value.domainNames?.length ?? 0) > 0, {
    message: 'Informe ao menos um domainIds ou domainNames.',
    path: ['domainIds'],
  });

export const createWafRulesetSchema = z.object({
  name: z.string().min(3).max(128),
  mode: z.enum(['learning', 'blocking']).default('blocking'),
  description: z.string().optional(),
});

export const applyWafRulesetSchema = z.object({
  firewallId: z.string().min(1),
  rulesetId: z.string().min(1),
  order: z.number().int().min(0).default(0),
});
