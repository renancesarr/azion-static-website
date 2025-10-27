import {
  stackValidateSchema,
  mimetypeValidationSchema,
  idempotencyValidationSchema,
  uploadLogInspectSchema,
  bucketConflictSchema,
  domainConflictSchema,
} from '../../constants/validationSchemas.js';
import type {
  StackValidateInputDto,
  MimetypeValidationInputDto,
  IdempotencyValidationInputDto,
  UploadLogInspectInputDto,
  BucketConflictInputDto,
  DomainConflictInputDto,
} from '../../models/dto/validationInputs.js';

export const stackValidateInputSchema = stackValidateSchema;
export const mimetypeValidationInputSchema = mimetypeValidationSchema;
export const idempotencyValidationInputSchema = idempotencyValidationSchema;
export const uploadLogInspectInputSchema = uploadLogInspectSchema;
export const bucketConflictInputSchema = bucketConflictSchema;
export const domainConflictInputSchema = domainConflictSchema;

export type StackValidateInput = StackValidateInputDto;
export type MimetypeValidationInput = MimetypeValidationInputDto;
export type IdempotencyValidationInput = IdempotencyValidationInputDto;
export type UploadLogInspectInput = UploadLogInspectInputDto;
export type BucketConflictInput = BucketConflictInputDto;
export type DomainConflictInput = DomainConflictInputDto;
