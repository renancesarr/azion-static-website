import { azionApiBase } from '../../utils/env.js';
import { http } from '../../utils/http.js';
import type { SecurityDependencies } from './types.js';

export const defaultSecurityDependencies: SecurityDependencies = {
  apiBase: azionApiBase(),
  http,
};
