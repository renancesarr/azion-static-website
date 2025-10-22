import { requiredEnv } from './env.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequestOptions {
  method: HttpMethod;
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface HttpSuccess<T> {
  status: number;
  statusText: string;
  data: T;
  headers: Headers;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: string | null;
  public readonly request: {
    method: HttpMethod;
    url: string;
  };

  constructor(message: string, status: number, statusText: string, body: string | null, request: { method: HttpMethod; url: string }) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.request = request;
  }
}

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

export async function http<T = unknown>(options: HttpRequestOptions): Promise<HttpSuccess<T>> {
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
      { method: options.method, url: options.url },
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
