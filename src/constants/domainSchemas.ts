import { z } from 'zod';

export const createDomainSchema = z.object({
  name: z.string().min(3).max(255).regex(/^[a-z0-9.-]+$/i),
  edgeApplicationId: z.string().min(1),
  isActive: z.boolean().default(true),
  cname: z.string().optional(),
});

export const dnsInstructionsSchema = z.object({
  domainName: z.string().min(3).max(255),
  edgeApplicationId: z.string().min(1).optional(),
});
