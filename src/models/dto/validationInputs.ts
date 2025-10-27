import type { z } from 'zod';
import {
  stackValidateSchema,
  mimetypeValidationSchema,
  idempotencyValidationSchema,
  uploadLogInspectSchema,
  bucketConflictSchema,
  domainConflictSchema,
} from '../../constants/validationSchemas.js';

export type StackValidateInputDto = z.infer<typeof stackValidateSchema>;
export type MimetypeValidationInputDto = z.infer<typeof mimetypeValidationSchema>;
export type IdempotencyValidationInputDto = z.infer<typeof idempotencyValidationSchema>;
export type UploadLogInspectInputDto = z.infer<typeof uploadLogInspectSchema>;
export type BucketConflictInputDto = z.infer<typeof bucketConflictSchema>;
export type DomainConflictInputDto = z.infer<typeof domainConflictSchema>;
