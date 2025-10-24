import type { HttpRequestOptions, HttpSuccess } from '../../utils/http.js';

export type HttpFn = <T>(options: HttpRequestOptions) => Promise<HttpSuccess<T>>;

export interface DomainDependencies {
  apiBase: string;
  http: HttpFn;
}
