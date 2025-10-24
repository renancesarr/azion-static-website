export function normalizeObjectPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '');
}

export function applyPrefix(path: string, prefix?: string): string {
  if (!prefix) {
    return path;
  }

  const trimmedPrefix = normalizeObjectPath(prefix).replace(/\/+$/, '');
  if (!trimmedPrefix) {
    return path;
  }

  return `${trimmedPrefix}/${path}`;
}
