import { promises as fs } from 'node:fs';
import type { ValidationDependencies } from './types.js';
import { fetchHttpClient } from '../../utils/http.js';
import { SystemClock } from '../../core/time/SystemClock.js';
import { fileStateRepository } from '../../utils/state.js';
import { ConsoleLogger } from '../../core/logging/ConsoleLogger.js';

export const defaultValidationDependencies: ValidationDependencies = {
  http: fetchHttpClient,
  clock: new SystemClock(),
  state: fileStateRepository,
  logger: new ConsoleLogger(),
  setTimeout: (handler, timeout) => setTimeout(handler, timeout),
  clearTimeout: (id) => clearTimeout(id),
  readDir: (path) => fs.readdir(path),
  readFile: (path, encoding) => fs.readFile(path, encoding),
};
