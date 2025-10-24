import {
  stackValidateSchema,
  mimetypeValidationSchema,
  idempotencyValidationSchema,
  uploadLogInspectSchema,
  bucketConflictSchema,
  domainConflictSchema,
} from '../../constants/validationSchemas.js';

export const stackValidateInputSchema = stackValidateSchema;
export const mimetypeValidationInputSchema = mimetypeValidationSchema;
export const idempotencyValidationInputSchema = idempotencyValidationSchema;
export const uploadLogInspectInputSchema = uploadLogInspectSchema;
export const bucketConflictInputSchema = bucketConflictSchema;
export const domainConflictInputSchema = domainConflictSchema;

export type StackValidateInput = typeof stackValidateSchema._type;
export type MimetypeValidationInput = typeof mimetypeValidationSchema._type;
export type IdempotencyValidationInput = typeof idempotencyValidationSchema._type;
export type UploadLogInspectInput = typeof uploadLogInspectSchema._type;
export type BucketConflictInput = typeof bucketConflictSchema._type;
export type DomainConflictInput = typeof domainConflictSchema._type;
