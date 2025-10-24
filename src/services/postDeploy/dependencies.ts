import { fetchHttpClient } from '../../utils/http.js';
import { ConsoleLogger } from '../../core/logging/ConsoleLogger.js';
import { SystemClock } from '../../core/time/SystemClock.js';
import type { PostDeployDependencies } from './types.js';

export const defaultPostDeployDependencies: PostDeployDependencies = {
  http: fetchHttpClient,
  logger: new ConsoleLogger(),
  clock: new SystemClock(),
  setTimeout: (handler, timeout) => setTimeout(handler, timeout),
  clearTimeout: (id) => clearTimeout(id),
};
