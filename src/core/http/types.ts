export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequestOptions {
  method: HttpMethod;
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface HttpSuccess<T> {
  status: number;
  statusText: string;
  data: T;
  headers: Headers;
}
