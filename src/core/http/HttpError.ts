import { HttpMethod } from './types.js';

export class HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: string | null;
  public readonly request: {
    method: HttpMethod;
    url: string;
  };

  constructor(
    message: string,
    status: number,
    statusText: string,
    body: string | null,
    request: { method: HttpMethod; url: string },
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.request = request;
  }
}
