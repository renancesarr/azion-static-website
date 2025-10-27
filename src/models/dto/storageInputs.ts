import type { z } from 'zod';
import { createBucketSchema, putObjectSchema, uploadDirSchema } from '../../constants/storageSchemas.js';

export type CreateBucketInputDto = z.infer<typeof createBucketSchema>;
export type PutObjectInputDto = z.infer<typeof putObjectSchema>;
export type UploadDirInputDto = z.infer<typeof uploadDirSchema>;
