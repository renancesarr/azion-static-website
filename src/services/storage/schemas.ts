import { z } from 'zod';
import { createBucketSchema, putObjectSchema, uploadDirSchema } from '../../constants/storageSchemas.js';

export const createBucketInputSchema = createBucketSchema;
export const putObjectInputSchema = putObjectSchema;
export const uploadDirInputSchema = uploadDirSchema;

export type CreateBucketInput = z.infer<typeof createBucketSchema>;
export type PutObjectInput = z.infer<typeof putObjectSchema>;
export type UploadDirInput = z.infer<typeof uploadDirSchema>;
