export function buildObjectUrl(apiBase: string, bucketId: string, objectPath: string): string {
  const encodedPath = objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${apiBase}/v4/storage/buckets/${encodeURIComponent(bucketId)}/objects/${encodedPath}`;
}
