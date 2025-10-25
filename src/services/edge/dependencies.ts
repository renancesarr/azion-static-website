import { azionApiBase } from '../../utils/env.js';
import { fetchHttpClient } from '../../utils/http.js';
import { fileStateRepository } from '../../utils/state.js';
import { ConsoleLogger } from '../../core/logging/ConsoleLogger.js';
import type { EdgeDependencies } from './types.js';

export const defaultEdgeDependencies: EdgeDependencies = {
  apiBase: azionApiBase(),
  http: fetchHttpClient,
  state: fileStateRepository,
  logger: new ConsoleLogger(),
};
