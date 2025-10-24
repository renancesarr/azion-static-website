import { HttpRequestOptions, HttpSuccess } from './types.js';

export interface HttpClient {
  request<T = unknown>(options: HttpRequestOptions): Promise<HttpSuccess<T>>;
}
