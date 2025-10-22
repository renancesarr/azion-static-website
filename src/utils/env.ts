export class MissingEnvError extends Error {
  constructor(variable: string) {
    super(`Variável de ambiente obrigatória ausente: ${variable}`);
    this.name = 'MissingEnvError';
  }
}

export function requiredEnv(variable: string): string {
  const value = process.env[variable];
  if (!value || value.trim() === '') {
    throw new MissingEnvError(variable);
  }

  return value;
}

export function optionalEnv(variable: string, fallback?: string): string | undefined {
  const value = process.env[variable];
  if (value && value.trim() !== '') {
    return value;
  }

  return fallback;
}

const DEFAULT_AZION_API_BASE = 'https://api.azion.com';

export function azionApiBase(): string {
  const base = optionalEnv('AZION_API_BASE', DEFAULT_AZION_API_BASE) ?? DEFAULT_AZION_API_BASE;
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

export function uploadConcurrency(defaultValue = 4): number {
  const raw = optionalEnv('UPLOAD_CONCURRENCY');
  if (!raw) {
    return defaultValue;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return parsed;
}
