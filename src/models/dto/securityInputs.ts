import type { z } from 'zod';
import {
  configureWafSchema,
  wafStatusSchema,
  createFirewallSchema,
  createWafRulesetSchema,
  applyWafRulesetSchema,
} from '../../constants/securitySchemas.js';

export type ConfigureWafInputDto = z.infer<typeof configureWafSchema>;
export type WafStatusInputDto = z.infer<typeof wafStatusSchema>;
export type CreateFirewallInputDto = z.infer<typeof createFirewallSchema>;
export type CreateWafRulesetInputDto = z.infer<typeof createWafRulesetSchema>;
export type ApplyWafRulesetInputDto = z.infer<typeof applyWafRulesetSchema>;
