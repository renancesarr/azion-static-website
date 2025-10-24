import { z } from 'zod';
import { pathCheckSchema, postDeployCheckSchema } from '../../constants/postDeploySchemas.js';

export const postDeployCheckInputSchema = postDeployCheckSchema;
export const pathCheckInputSchema = pathCheckSchema;

export type PostDeployCheckInput = z.infer<typeof postDeployCheckSchema>;
export type PathCheckInput = z.infer<typeof pathCheckSchema>;
