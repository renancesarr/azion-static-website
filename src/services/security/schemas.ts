import { z } from 'zod';
import {
  configureWafSchema,
  wafStatusSchema,
  createFirewallSchema,
  createWafRulesetSchema,
  applyWafRulesetSchema,
} from '../../constants/securitySchemas.js';

export const configureWafInputSchema = configureWafSchema;
export const wafStatusInputSchema = wafStatusSchema;
export const createFirewallInputSchema = createFirewallSchema;
export const createWafRulesetInputSchema = createWafRulesetSchema;
export const applyWafRulesetInputSchema = applyWafRulesetSchema;

export type ConfigureWafInput = z.infer<typeof configureWafSchema>;
export type WafStatusInput = z.infer<typeof wafStatusSchema>;
export type CreateFirewallInput = z.infer<typeof createFirewallSchema>;
export type CreateWafRulesetInput = z.infer<typeof createWafRulesetSchema>;
export type ApplyWafRulesetInput = z.infer<typeof applyWafRulesetSchema>;
