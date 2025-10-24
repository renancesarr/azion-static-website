import { azionApiBase, uploadConcurrency } from '../../utils/env.js';
import { http } from '../../utils/http.js';
import type { StorageDependencies } from './types.js';

export const defaultStorageDependencies: StorageDependencies = {
  apiBase: azionApiBase(),
  http,
  uploadConcurrency: uploadConcurrency,
};
