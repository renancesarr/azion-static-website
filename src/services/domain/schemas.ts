import { z } from 'zod';
import { createDomainSchema, dnsInstructionsSchema } from '../../constants/domainSchemas.js';

export const createDomainInputSchema = createDomainSchema;
export const dnsInstructionsInputSchema = dnsInstructionsSchema;

export type CreateDomainInput = z.infer<typeof createDomainSchema>;
export type DnsInstructionsInput = z.infer<typeof dnsInstructionsSchema>;
