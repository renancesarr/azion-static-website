import { azionApiBase } from '../../utils/env.js';
import { http } from '../../utils/http.js';
import type { DomainDependencies } from './types.js';

export const defaultDomainDependencies: DomainDependencies = {
  apiBase: azionApiBase(),
  http,
};
