import { createBucketSchema, putObjectSchema, uploadDirSchema } from '../../constants/storageSchemas.js';
import type {
  CreateBucketInputDto,
  PutObjectInputDto,
  UploadDirInputDto,
} from '../../models/dto/storageInputs.js';

export const createBucketInputSchema = createBucketSchema;
export const putObjectInputSchema = putObjectSchema;
export const uploadDirInputSchema = uploadDirSchema;

export type CreateBucketInput = CreateBucketInputDto;
export type PutObjectInput = PutObjectInputDto;
export type UploadDirInput = UploadDirInputDto;
