import { performance } from 'node:perf_hooks';
import type { PostDeployDependencies } from './types.js';

export const defaultPostDeployDependencies: PostDeployDependencies = {
  fetch,
  now: () => performance.now(),
  setTimeout: (handler, timeout) => setTimeout(handler, timeout),
  clearTimeout: (id) => clearTimeout(id),
};
