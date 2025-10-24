import { promises as fs } from 'node:fs';
import { performance } from 'node:perf_hooks';
import type { ValidationDependencies } from './types.js';

export const defaultValidationDependencies: ValidationDependencies = {
  fetch,
  now: () => performance.now(),
  setTimeout: (handler, timeout) => setTimeout(handler, timeout),
  clearTimeout: (id) => clearTimeout(id),
  readDir: (path) => fs.readdir(path),
  readFile: (path, encoding) => fs.readFile(path, encoding),
};
