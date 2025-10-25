import { azionApiBase, uploadConcurrency } from '../../utils/env.js';
import { fetchHttpClient } from '../../utils/http.js';
import { fileStateRepository } from '../../utils/state.js';
import { ConsoleLogger } from '../../core/logging/ConsoleLogger.js';
import type { StorageDependencies } from './types.js';

export const defaultStorageDependencies: StorageDependencies = {
  apiBase: azionApiBase(),
  http: fetchHttpClient,
  state: fileStateRepository,
  logger: new ConsoleLogger(),
  uploadConcurrency: uploadConcurrency,
};
