export interface StorageBucketRecord {
  id: string;
  name: string;
  edgeAccess?: string;
  description?: string;
  region?: string;
  createdAt: string;
  raw: unknown;
}
