import { requiredEnv } from './env.js';
import { HttpClient } from '../core/http/HttpClient.js';
import { HttpError } from '../core/http/HttpError.js';
import { HttpRequestOptions, HttpSuccess, HttpMethod } from '../core/http/types.js';

const JSON_CONTENT_TYPES = new Set(['application/json', 'application/vnd.api+json']);

function serializeBody(body: unknown): { payload?: BodyInit; contentType?: string } {
  if (body === undefined || body === null) {
    return { payload: undefined };
  }

  if (typeof body === 'string' || body instanceof ArrayBuffer || body instanceof Blob || body instanceof FormData || body instanceof URLSearchParams) {
    return { payload: body };
  }

  if (body instanceof Uint8Array) {
    return { payload: body as unknown as BodyInit };
  }

  return {
    payload: JSON.stringify(body),
    contentType: 'application/json',
  };
}

export class FetchHttpClient implements HttpClient {
  async request<T = unknown>(options: HttpRequestOptions): Promise<HttpSuccess<T>> {
    const azionToken = requiredEnv('AZION_TOKEN');
    const { payload, contentType } = serializeBody(options.body);

    const headers = new Headers({
      Accept: 'application/json',
      Authorization: `Bearer ${azionToken}`,
      ...options.headers,
    });

    if (contentType && !headers.has('content-type')) {
      headers.set('content-type', contentType);
    }

    const response = await fetch(options.url, {
      method: options.method,
      body: payload,
      headers,
      signal: options.signal,
    });

    const responseText = await response.text();
    const contentTypeHeader = response.headers.get('content-type') ?? '';
    const isJson = [...JSON_CONTENT_TYPES].some((type) => contentTypeHeader.startsWith(type));

    if (!response.ok) {
      throw new HttpError(
        `Erro HTTP ${response.status} ${response.statusText} ao chamar ${options.method} ${options.url}`,
        response.status,
        response.statusText,
        responseText || null,
        { method: options.method as HttpMethod, url: options.url },
      );
    }

    let data: T;
    if (isJson && responseText) {
      data = JSON.parse(responseText) as T;
    } else {
      data = (responseText as unknown) as T;
    }

    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: response.headers,
    };
  }
}

export const fetchHttpClient = new FetchHttpClient();

export async function http<T = unknown>(options: HttpRequestOptions): Promise<HttpSuccess<T>> {
  return await fetchHttpClient.request<T>(options);
}

export type { HttpRequestOptions, HttpSuccess, HttpMethod } from '../core/http/types.js';
export { HttpError } from '../core/http/HttpError.js';
