import {
  configureWafSchema,
  wafStatusSchema,
  createFirewallSchema,
  createWafRulesetSchema,
  applyWafRulesetSchema,
} from '../../constants/securitySchemas.js';
import type {
  ConfigureWafInputDto,
  WafStatusInputDto,
  CreateFirewallInputDto,
  CreateWafRulesetInputDto,
  ApplyWafRulesetInputDto,
} from '../../models/dto/securityInputs.js';

export const configureWafInputSchema = configureWafSchema;
export const wafStatusInputSchema = wafStatusSchema;
export const createFirewallInputSchema = createFirewallSchema;
export const createWafRulesetInputSchema = createWafRulesetSchema;
export const applyWafRulesetInputSchema = applyWafRulesetSchema;

export type ConfigureWafInput = ConfigureWafInputDto;
export type WafStatusInput = WafStatusInputDto;
export type CreateFirewallInput = CreateFirewallInputDto;
export type CreateWafRulesetInput = CreateWafRulesetInputDto;
export type ApplyWafRulesetInput = ApplyWafRulesetInputDto;
